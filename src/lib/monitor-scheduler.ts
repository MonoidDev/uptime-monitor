import * as schedule from 'node-schedule';

import Monitor from './monitor';

class Scheduler {
  private static instance: Scheduler;

  public static get Instance() {
    // eslint-disable-next-line no-return-assign
    return this.instance || (this.instance = new this());
  }

  private enabled: Boolean;

  private runningJob?: schedule.Job;

  private monitor = new Monitor();

  private constructor() {
    this.enabled = false;
  }

  public start(): Boolean {
    if (this.enabled) return false;

    this.runningJob = schedule.scheduleJob('* * * * * *', async () => {
      try {
        await this.monitor.run();
      } catch (error) {
        console.error(error);
      }
    });

    this.enabled = true;
    console.info('scheduler started');
    return true;
  }

  public stop(): Boolean {
    if (!this.enabled) return true;

    this.runningJob?.cancel();
    this.enabled = false;
    console.info('scheduler stopped');
    return true;
  }
}

export default Scheduler.Instance;
