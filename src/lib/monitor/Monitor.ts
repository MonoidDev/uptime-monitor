import { Server } from 'http';

import { ErrorPredicate, TraceStatus } from '@prisma/client';
import { MonitorService, WebsiteWithHooks } from 'app/services/MonitorService';
import express from 'express';
import {
  defer,
  map,
  merge,
  Observable,
  BehaviorSubject,
  mergeAll,
  switchAll,
  throttleTime,
  Subject,
} from 'rxjs';

import { doPing, PingResult } from './doPing';
import { MonitorConfig } from './MonitorConfig';
import { monitorDebug } from './utils';

interface PingTask {
  website: WebsiteWithHooks;
}

interface Schedule {
  website: WebsiteWithHooks;
  pingTask: Subject<PingTask>;
  scheduler: Observable<PingTask>;
}

function createSchedule(website: WebsiteWithHooks): Schedule {
  const pingTask: Subject<PingTask> = new Subject<PingTask>();
  const pingInterval = website.pingInterval * 1000;

  const scheduler = new Subject<PingTask>();
  pingTask
    .pipe(
      throttleTime(pingInterval, undefined, { leading: true, trailing: true }),
      // Throttle the task to respect pingInterval.
      // We use throttling instead of interval, because the task is only scheduled when the website is
      // added, or it has just finished last fetching. Using fixed periodic fetching may overwhelm the worker
      // when it cannot consume tasks fast enough.
    )
    .forEach((task) => {
      scheduler.next(task);
    });

  return {
    website,
    pingTask,
    scheduler,
  };
}

const monitorService = new MonitorService();

const PORT = 5656;

export class Monitor {
  schedules: BehaviorSubject<Schedule[]> = new BehaviorSubject<Schedule[]>([]);

  server: Server;

  app: express.Express;

  constructor(public config: MonitorConfig) {
    this.app = express();

    this.app.use((req, res, next) => {
      const t1 = Date.now();
      next();

      monitorDebug(`${req.method} ${req.url}`);
      res.on('close', () => {
        monitorDebug(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - t1}ms`);
      });
    });

    this.app.post('/website-updated/:id', async (res, req) => {
      const id = Number(res.params.id);
      const website = await monitorService.findWebsiteById(id);

      const isEnabled = website?.enabled;

      this.schedules.next([
        ...this.schedules.getValue().filter((s) => s.website.id !== id),
        ...(isEnabled ? [createSchedule(website)] : []),
      ]);

      if (isEnabled) {
        monitorDebug(`reseting ${website.url}`);
        this.scheduleNextPingTask(website);
      } else {
        monitorDebug(`stopping ${id} (${website?.url})`);
      }

      req.sendStatus(201);
    });

    this.server = this.app.listen(PORT, () => {
      monitorDebug(`Monitor listening on http://localhost:${PORT}`);
    });
  }

  dispose() {
    this.server.close();
    this.schedules.unsubscribe();
  }

  scheduleAllPingTasks() {
    this.schedules.getValue().forEach(({ pingTask, website }) => {
      pingTask.next({ website });
    });
  }

  scheduleNextPingTask(website: WebsiteWithHooks) {
    monitorDebug(`scheduling ${website.url}`);

    this.schedules
      .getValue()
      .find((w) => w.website.id === website.id)
      ?.pingTask.next({ website });
  }

  async run() {
    const websites = await monitorService.findAllEnabledWebsites();
    this.schedules.next(websites.map((w) => createSchedule(w)));

    this.schedules
      .pipe(
        map((schedule) => merge(...schedule.map((s) => s.scheduler))),
        // Each time the schedules is updated, get all the task emitters, then merge theme into one emitter
        switchAll(),
        // Always use the latest task emitter, representing the current schedules
        map((task) => defer(() => this.handleWebsite(task.website))),
        // Create lazy task runners, so that the fetching only happens when subbed
        mergeAll(this.config.concurrency),
        // Allow fetching up to N tasks at one time
      )
      .subscribe();

    this.scheduleAllPingTasks();
  }

  async handleWebsite(website: WebsiteWithHooks) {
    monitorDebug('handling', website.url);
    try {
      const lastTrace = await monitorService.findLatestTraceByWebsite(website.id);
      const result = await this.pingWebsite(website);
      const currentTrace = await monitorService.addTrace(website, result);
      await Promise.all([
        ...this.config.plugins.map((p) =>
          p.onTraceFetched?.(website, lastTrace, currentTrace, result),
        ),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      monitorDebug('finished', website.url);
      this.scheduleNextPingTask(website);
    }
  }

  async pingWebsite(website: WebsiteWithHooks): Promise<PingResult> {
    const result = await doPing(website.url, 2); // 3 times
    if (result.statusCode && result.statusCode > 0) {
      if (website.errorPredicate === ErrorPredicate.HTTP_NOT_5XX) {
        if (result.statusCode >= 500 && result.statusCode < 600) {
          result.traceStatus = TraceStatus.HTTP_ERROR;
        } else {
          result.traceStatus = TraceStatus.OK;
        }
      } else {
        // ErrorPredicate.HTTP_2XX_ONLY is default
        if (result.statusCode >= 200 && result.statusCode < 300) {
          result.traceStatus = TraceStatus.OK;
        } else {
          result.traceStatus = TraceStatus.HTTP_ERROR;
        }
      }
    }
    return result;
  }
}
