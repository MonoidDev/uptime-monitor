import Monitor from './monitor';

class Scheduler {
  private static instance: Scheduler;

  public static get Instance() {
    // eslint-disable-next-line no-return-assign
    return this.instance || (this.instance = new this());
  }

  private enabled: Boolean;

  private runningJob?: NodeJS.Timer;

  private monitor = new Monitor();

  private constructor() {
    this.enabled = false;
  }

  public start(): Boolean {
    if (this.enabled) return false;

    this.runningJob = setInterval(async () => {
      try {
        await this.monitor.run();
      } catch (error) {
        console.error(error);
      }
    }, 1000);

    this.enabled = true;
    console.info('scheduler started');
    return true;
  }

  public stop(): Boolean {
    if (!this.enabled) return true;

    if (this.runningJob) {
      clearInterval(this.runningJob);
    }

    this.enabled = false;
    console.info('scheduler stopped');
    return true;
  }
}

export default Scheduler.Instance;
