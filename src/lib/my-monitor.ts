import { MonitorService } from '../services/MonitorService';
import { doPing, PingResult } from './my-fetch';
import { Trace, Website } from '.prisma/client';

const monitorService = new MonitorService();

class MyMonitor {
  public async run() {
    return this.scanWebsites();
  }

  public async scanWebsites() {
    const startAt = new Date();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[monitor] scanning at ${startAt.toISOString()}`);
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
      console.log(`[monitor] scheduled / found = ${futures.length} / ${nWebsites}`);
    }

    await Promise.all(futures);

    if (process.env.NODE_ENV !== 'production') {
      const endAt = new Date();
      const duration = endAt.getTime() - startAt.getTime();
      console.log(`[monitor] done in ${duration}ms`);
    }
  }

  private checkInterval(website: Website, lastTrace: Trace | null, now: Date) : Boolean {
    const lastAt = lastTrace ? lastTrace.createdAt.getTime() : website.createdAt.getTime();
    const nextAt = lastAt + website.pingInterval * 1000;
    const nowAt = now.getTime();
    // console.log(`[monitor] check ${website.id}: lastAt ${lastAt} nextAt ${nextAt} nowAt ${nowAt}`);
    return nextAt < nowAt;
  }

  private async processWebsite(website: Website, lastTrace: Trace | null) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[monitor] process ${website.id}`);
    }

    const result: PingResult = await doPing(website.url);
    const trace = await monitorService.addTrace(website, result);
    if (this.checkEvent(website, lastTrace, trace)) {
      const websiteEvent = {};
      await monitorService.addEvent(website, websiteEvent);
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  private checkEvent(
    website: Website,
    lastTrace: Trace | null,
    currentTrace: Trace | null,
  ) : Boolean {
    return true;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export default MyMonitor;
