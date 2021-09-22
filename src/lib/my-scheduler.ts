import { CronService } from '../services/CronService';
import { doPing, PingResult } from './my-fetch';
import { Website } from '.prisma/client';

const cronService = new CronService();
const sche = require('node-schedule');

class Scheduler {
  private static instance: Scheduler;

  public static get Instance(): Scheduler {
    // eslint-disable-next-line no-return-assign
    return this.instance || (this.instance = new this());
  }

  private enabled: Boolean;

  private runningJob: any;

  private constructor() {
    this.enabled = false;
  }

  public enable(): Boolean {
    if (this.enabled) return false;

    const rule = new sche.RecurrenceRule();
    rule.second = 1;

    this.runningJob = sche.scheduleJob(rule, async (self: Scheduler) => {
      await self.scan();
    }).bind(this);

    this.enabled = true;
    console.log('[cron] enabled');
    return true;
  }

  public disable(): Boolean {
    if (!this.enabled) return true;

    this.runningJob.cancel();
    this.enabled = false;
    console.log('[cron] disabled');
    return true;
  }

  private async scan() {
    const now = new Date();
    const futures = new Array<Promise<void>>();
    let lastId: number | null = null;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const websites: Website[] = await cronService.findEnabledWebsites(lastId);
      if (websites.length === 0) {
        break;
      }
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      websites.forEach((website) => {
        futures.push(this.processWebsite(website, now));
        if ((lastId === null) || (lastId as number > website.id)) {
          lastId = website.id;
        }
      });
    }
    await Promise.all(futures);
  }

  private async processWebsite(website: Website, now: Date) {
    const trace = await cronService.findLatestTraceByWebsite(website.id);
    const lastAt = trace ? trace.createdAt : website.createdAt;
    if (lastAt.getTime() + website.pingInterval * 1000 < now.getTime()) {
      return;
    }

    const result: PingResult = await doPing(website.url);
    await cronService.addTrace(website, result);
  }
}

export default Scheduler.Instance;
