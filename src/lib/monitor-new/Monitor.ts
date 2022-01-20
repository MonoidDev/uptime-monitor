import { ErrorPredicate, TraceStatus } from '@prisma/client';
import { MonitorService, WebsiteWithHooks } from 'app/services/MonitorService';
import { defer, map, mergeAll, Subject } from 'rxjs';

import { PingResult } from '../monitor/monitor-fetch';
import { doPing } from './doPing';
import { MonitorConfig } from './MonitorConfig';
import { monitorDebug } from './utils';

export interface PingTask {
  deadline: number;
  website: WebsiteWithHooks;
}

const monitorService = new MonitorService();

export class Monitor {
  tasks: Subject<PingTask> = new Subject();

  websites: WebsiteWithHooks[] = [];

  constructor(public config: MonitorConfig) {}

  dispose() {}

  async loadWebsites() {
    const websites = await monitorService.findAllEnabledWebsites();
    this.websites = websites;
  }

  async run() {
    await this.loadWebsites();

    this.tasks
      .pipe(
        map((task) => defer(() => this.handleWebsite(task.website))),
        mergeAll(this.config.concurrency),
      )
      .subscribe();

    this.websites.forEach((website) => {
      this.enqueueTaskByWebsite(website, true);
    });
  }

  enqueueTaskByWebsite(website: WebsiteWithHooks, immediate: boolean = true) {
    monitorDebug('enqueing', website.url);
    const deadline = Date.now() + website.pingInterval * 1000;

    if (immediate) {
      this.tasks.next({
        deadline,
        website,
      });
    } else {
      setTimeout(() => {
        this.tasks.next({
          deadline,
          website,
        });
      }, website.pingInterval * 1000);
    }
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
    }
    const nextWebsite = await monitorService.findWebisteById(website.id);
    if (nextWebsite?.enabled) {
      this.enqueueTaskByWebsite(nextWebsite, false);
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
