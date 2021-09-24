import { CronService } from '../services/CronService';
import { doPing, PingResult } from './my-fetch';
import { Trace, Website } from '.prisma/client';

const cronService = new CronService();

class MyMonitor {
  public async run() {
    console.log(`[MyMonitor] start at ${new Date().toISOString()}`);
    return this.scanWebsites();
  }

  public async scanWebsites() {
    const now = new Date();
    const futures = new Array<Promise<void>>();
    let nWebsites = 0;
    let lastId: number | null = null;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const websites: Website[] = await cronService.findEnabledWebsites(lastId);
      if (websites.length === 0) {
        break;
      }
      nWebsites += websites.length;

      // eslint-disable-next-line @typescript-eslint/no-loop-func
      websites.forEach(async (website) => {
        const trace = await cronService.findLatestTraceByWebsite(website.id);
        if (this.checkInterval(website, trace, now)) {
          futures.push(this.processWebsite(website, trace));
          if ((lastId === null) || (lastId as number > website.id)) {
            lastId = website.id;
          }
        }
      });
    }
    console.log(`[MyMonitor] scheduled websites: ${futures.length} / ${nWebsites}`);
    return Promise.all(futures);
  }

  private checkInterval(website: Website, lastTrace: Trace | null, now: Date) : Boolean {
    if (!lastTrace) {
      return true;
    }
    const lastAt = lastTrace ? lastTrace.createdAt : website.createdAt;
    const nextAt = lastAt.getTime() + website.pingInterval * 1000;
    return nextAt >= now.getTime();
  }

  private async processWebsite(website: Website, lastTrace: Trace | null) {
    const result: PingResult = await doPing(website.url);
    const trace = await cronService.addTrace(website, result);
    if (this.checkEvent(website, lastTrace, trace)) {
      const websiteEvent = {};
      await cronService.addEvent(website, websiteEvent);
    }
  }

  private checkEvent(website: Website, lastTrace: Trace | null, currentTrace: Trace | null) : Boolean {
    return true;
  }
}

export default MyMonitor;
