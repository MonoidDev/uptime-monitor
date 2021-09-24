import MyMonitor from './my-monitor';
const sche = require('node-schedule');

class MyScheduler {
  private static instance: MyScheduler;

  public static get Instance(): MyScheduler {
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

    this.runningJob = sche.scheduleJob('* * * * * *', async () => {
      try {
        const instance = new MyMonitor();
        return instance.run();
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

    this.runningJob.cancel();
    this.enabled = false;
    console.log('[MyScheduler] disabled');
    return true;
  }
}

export default MyScheduler.Instance;
