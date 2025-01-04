
type OnChangeCallback = (event: KeyboardEvent) => null;

/**
 * This method is used to buffer data (keystrokes/websocket data)
 * and to notify any subscribers of that data. It's essentially an observable.
 * It was initially added to test the game mechanics with the keyboard, but I
 * decided to build the SocketHandler on top of it, as it has similar requirements.
 */
export default abstract class InputHandler {
  private callbacks: OnChangeCallback[] = [];

  /**
   * Calling this method notifies all subscribers and passes optional event data to their callbacks.
   * @param eventData This data will be passed to the callbacks.
   * @protected
   */
  protected inputChanged(eventData?: any) {
    for (const callback of this.callbacks) callback(eventData);
  }

  /**
   * Subscribe to any changes on this input handler.
   * @param callback This callback will be called when inputChanged() is called
   */
  public subscribe(callback: OnChangeCallback) {
    this.callbacks.push(callback);
  }
}
