import { WebsiteEventSource } from 'app/graphql/types/EventSchema';
import { WebsiteEventParams } from 'app/models/WebsiteEvent';
import { MonitorService } from 'app/services/MonitorService';

import { doPing, PingResult } from './monitor-fetch';
import { Trace, TraceStatus, Website } from '.prisma/client';

const monitorService = new MonitorService();

class Monitor {
  public async run() {
    return this.scanWebsites();
  }

  public async scanWebsites() {
    const startAt = new Date();

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[monitor] scanning at ${startAt.toISOString()}`);
    }

    let pagingCount: number = 0;
    if (process.env.NODE_ENV === 'production') {
      pagingCount = 100;
    } else {
      pagingCount = 1;
    }

    const futures = new Array<Promise<void>>();
    let nWebsites = 0;

    let lastId: number | null = null;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const websites: Website[] = await monitorService.findEnabledWebsites(pagingCount, lastId);
      if (websites.length === 0) {
        break;
      }
      nWebsites += websites.length;
      lastId = websites[websites.length - 1].id;

      // console.log(`[monitor] found ${websites.length} in ${nWebsites}, lastId=${lastId}`);

      // eslint-disable-next-line @typescript-eslint/no-loop-func
      websites.forEach(async (website) => {
        const trace = await monitorService.findLatestTraceByWebsite(website.id);
        if (this.checkInterval(website, trace, startAt)) {
          futures.push(this.processWebsite(website, trace));
        }
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.info(`[monitor] scheduled / found = ${futures.length} / ${nWebsites}`);
    }

    await Promise.all(futures);

    if (process.env.NODE_ENV !== 'production') {
      const endAt = new Date();
      const duration = endAt.getTime() - startAt.getTime();
      console.info(`[monitor] done in ${duration}ms`);
    }
  }

  private checkInterval(website: Website, lastTrace: Trace | null, now: Date) : Boolean {
    // const lastAt = lastTrace ? lastTrace.createdAt.getTime() : website.createdAt.getTime();
    if (lastTrace === null) {
      return true;
    }
    const lastAt = lastTrace.createdAt.getTime();
    const nextAt = lastAt + website.pingInterval * 1000;
    const nowAt = now.getTime();
    // console.log(`[monitor] check ${website.id}: lastAt ${lastAt} nextAt ${nextAt} nowAt ${nowAt}`);
    return nextAt < nowAt;
  }

  private async processWebsite(website: Website, lastTrace: Trace | null) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[monitor] process ${website.id}`);
    }

    const result: PingResult = await doPing(website.url);
    const trace = await monitorService.addTrace(website, result);

    const eventAvailability = this.checkEventAvailability(website, lastTrace, trace);
    if (eventAvailability !== null) {
      await monitorService.addEvent(eventAvailability);
    }
  }

  private checkEventAvailability(
    website: Website,
    lastTrace: Trace | null,
    currentTrace: Trace,
  ) : WebsiteEventParams | null {
    const lastOk = (lastTrace === null) ? false : (lastTrace.status === TraceStatus.OK);
    const currentOk = currentTrace.status === TraceStatus.OK;
    if (lastOk === currentOk) {
      // no status changed
      return null;
    }

    if (currentOk) {
      const params: WebsiteEventParams = {
        source: WebsiteEventSource.Available,
        website,
        trace: currentTrace,
      };
      return params;
    }

    const params: WebsiteEventParams = {
      source: WebsiteEventSource.NotAvailable,
      website,
      trace: currentTrace,
    };
    return params;
  }
}

export default Monitor;
