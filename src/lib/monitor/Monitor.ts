import { Server } from 'http';

import { ErrorPredicate, TraceStatus } from '@prisma/client';
import { MonitorService, WebsiteWithHooks } from 'app/services/MonitorService';
import express from 'express';
import { defer, map, mergeAll, Subject } from 'rxjs';

import { doPing, PingResult } from './doPing';
import { MonitorConfig } from './MonitorConfig';
import { monitorDebug } from './utils';

export interface PingTask {
  deadline: number;
  websiteId: number;
}

const monitorService = new MonitorService();

const PORT = 5656;

export class Monitor {
  tasks: Subject<PingTask> = new Subject();

  enabledWebsites: Map<number, WebsiteWithHooks> = new Map();

  server: Server;

  app: express.Express;

  constructor(public config: MonitorConfig) {
    this.app = express();

    this.app.use((req, res, next) => {
      const t1 = Date.now();
      next();

      res.on('close', () => {
        monitorDebug(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - t1}ms`);
      });
    });

    this.app.post('/website-updated/:id', async (res, req) => {
      const id = Number(res.params.id);
      const website = await monitorService.findWebsiteById(id);
      if (website?.enabled) {
        monitorDebug(`website ${website.url} is enabled`);

        // We must update the information of the website here
        this.upsertEnabledWebsite(website);
        if (!this.isIdEnabled(id)) {
          await this.restartWebsite(website);
        }
      } else {
        monitorDebug(`website ${id} (${website?.url}) is disabled`);
        this.removeEnabledWebsite(id);
      }

      req.sendStatus(201);
    });

    this.server = this.app.listen(PORT, () => {
      monitorDebug(`Monitor listening on http://localhost:${PORT}`);
    });
  }

  dispose() {
    this.server.close();
  }

  async loadAllEnabledWebsites() {
    const websites = await monitorService.findAllEnabledWebsites();
    for (const website of websites) {
      await this.restartWebsite(website);
    }
  }

  async restartWebsite(website: WebsiteWithHooks, immediate: boolean = true) {
    this.upsertEnabledWebsite(website);
    await this.enqueueTaskByWebsite(website, immediate);
  }

  upsertEnabledWebsite(website: WebsiteWithHooks) {
    this.enabledWebsites.set(website.id, website);
  }

  removeEnabledWebsite(websiteId: number) {
    this.enabledWebsites.delete(websiteId);
  }

  isIdEnabled(id: number) {
    return this.enabledWebsites.has(id);
  }

  async run() {
    this.tasks
      .pipe(
        map((task) => defer(() => this.handleWebsite(task.websiteId))),
        mergeAll(this.config.concurrency),
      )
      .subscribe();

    await this.loadAllEnabledWebsites();
  }

  enqueueTaskByWebsite(website: WebsiteWithHooks, immediate: boolean = true): Promise<void> {
    monitorDebug('enqueing', website.url);
    const deadline = Date.now() + website.pingInterval * 1000;
    const websiteId = website.id;

    if (immediate) {
      this.tasks.next({
        deadline,
        websiteId,
      });
      return Promise.resolve();
    } else {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.tasks.next({
            deadline,
            websiteId,
          });
          resolve();
        }, website.pingInterval * 1000);
      });
    }
  }

  async handleWebsite(websiteId: number) {
    const website = this.enabledWebsites.get(websiteId);
    if (website == undefined) {
      monitorDebug(`handing website ${websiteId}, skipped because it is removed...`);
      return;
    }

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
      await this.enqueueTaskByWebsite(website, false);
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
