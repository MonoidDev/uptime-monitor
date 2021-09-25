import * as schedule from 'node-schedule';

import MyMonitor from './my-monitor';

class MyScheduler {
  private static instance: MyScheduler;

  public static get Instance(): MyScheduler {
    // eslint-disable-next-line no-return-assign
    return this.instance || (this.instance = new this());
  }

  private enabled: Boolean;

  private runningJob?: schedule.Job;

  private constructor() {
    this.enabled = false;
  }

  public enable(): Boolean {
    if (this.enabled) return false;

    this.runningJob = schedule.scheduleJob('* * * * * *', async () => {
      try {
        const instance = new MyMonitor();
        await instance.run();
      } catch (error) {
        console.error(error);
      }
    });

    this.enabled = true;
    console.log('[MyScheduler] enabled');
    return true;
  }

  public disable(): Boolean {
    if (!this.enabled) return true;

    this.runningJob?.cancel();
    this.enabled = false;
    console.log('[MyScheduler] disabled');
    return true;
  }
}

export default MyScheduler.Instance;
