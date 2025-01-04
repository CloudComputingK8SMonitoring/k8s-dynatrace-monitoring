const TARGET_FRAME_TIME = 1000 / 60;

/**
 * Provides functionality for getting the elapsed time in milliseconds and the time scaling factor.
 * This class also ensures that page visibility changes (e.g. switching to another tab) does not
 * cause weird behaviour like delta time spikes anywhere where time is used.
 */
class Time {
  private static readonly instance: Time = new Time();
  private start = Date.now();
  private elapsedMillis = 0;
  private timeFactor = 1;

  constructor() {
    document.addEventListener('visibilitychange', this.handlePageVisibilityChange.bind(this));
  }

  /**
   * This method ensures that the time delta never has crazy spikes due to infrequent calling of
   * updateMillis when the tab is not focused.
   * @private
   */
  private handlePageVisibilityChange() {
    const visible = document.visibilityState == 'visible';

    if (visible) {
      this.elapsedMillis = Date.now() - this.start;
      this.timeFactor = 1;
    }
  }

  /**
   * Computes new elapsed time and time factor
   */
  public updateMillis() {
    const previous = this.elapsedMillis;
    this.elapsedMillis = Date.now() - this.start;
    const timeStep = this.elapsedMillis - previous;
    this.timeFactor = timeStep / TARGET_FRAME_TIME;
  }

  /**
   * Returns the elapsed time in milliseconds since the initialization of Time
   */
  public millis() {
    return this.elapsedMillis;
  }

  /**
   * Returns the time factor for the current frame for a target frequency of 60Hz.
   * This factor can be used to e.g. scale the velocity of a player such that the
   * motion appears to be constant, even though the frame times fluctuate.
   */
  public getTimeFactor() {
    return this.timeFactor;
  }

  static getInstance() {
    return this.instance;
  }
}

export default Time.getInstance();
