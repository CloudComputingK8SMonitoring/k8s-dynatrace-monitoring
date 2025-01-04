// Jonas Karg 2023

type StateChangeCallback<T> = (newState?: T, data?: any) => void | any | Promise<any | void>;

type StateCallbackMap<T> = {
  [state: string]: StateChangeCallback<T>[]
}

type CallbackMap<T> = {
  // @ts-ignore
  [state: any]: StateChangeCallback<T>[]
}

/**
 * Essentially an observable.
 * This class has an internal state to which one can attach subscribers
 * using onStateChange(), onStateChangeTo() or defineBehaviour.
 * Subscriber callbacks will be called upon state change.
 */
export default class State<T> {

  protected readonly genericStateChangeCallbacks: StateChangeCallback<T>[] = [];
  protected readonly stateCallbackMap: StateCallbackMap<T> = {};
  protected state: T;

  constructor(initialState: T) {
    this.state = initialState;
  }

  /**
   * Calls all callbacks associated with the current state
   * @param data Data to pass to the callbacks
   * @protected
   */
  protected async runStateChangeCallbacks(data?: any) {
    for (const stateChangeCallback of this.genericStateChangeCallbacks) {
      await stateChangeCallback(this.state, data)
    }

    const stateHash: string = this.state.toString();
    const callbacks: StateChangeCallback<T>[] = this.stateCallbackMap[stateHash];
    if (callbacks === undefined) return;

    for (const callback of callbacks) {
      await callback(this.state, data);
    }
  }

  /**
   * Set the state of the state machine.
   * All attached callbacks for the new state will be called.
   * @param newState The new state of the state machine
   * @param data Optional data to pass to the callback
   * @param forceStateChange If set to true will call state change callbacks even
   *                         if the new state is the same as the new state.
   * @returns A promise that will resolve when all callbacks have been called
   */
  public async setState(newState: T, data: any = undefined, forceStateChange: boolean = false) {
    if (this.state !== newState || forceStateChange) {
      this.state = newState;
      await this.runStateChangeCallbacks(data);
    }
  }

  /**
   * Subscribes a callback to a specific state change.
   * @param state If the current state of the state machine matches this value, the callback will be called.
   * @param callback Will be called if the state of the state machine matches the state value.
   */
  public onStateChangeTo(state: number | string | boolean, callback: StateChangeCallback<T>) {
    const stateHash: string = state.toString();
    this.stateCallbackMap[stateHash] = this.stateCallbackMap[stateHash] || [];
    this.stateCallbackMap[stateHash].push(callback);
  }

  /**
   * This method allows defining the callbacks in bulk.
   * Already existing callbacks will not be overridden.
   * @param callbackMap A StateCallbackMap<T> which maps states to
   *  the callbacks that will be called when transitioning to that state
   *
   * @example
   * enum GameStates { WAITING_FOR_PLAYERS, GAME_RUNNING, GAME_OVER }
   * const gameState = new State<GameStates>();
   *
   * gameState.defineBehaviour({
   *   [GameStates.WAITING_FOR_PLAYERS]: () => console.log('now waiting for players'),
   *   [GameStates.GAME_RUNNING]: () => console.log('game has started'),
   *   [GameStates.GAME_OVER]: () => console.log('game over'),
   *   ...
   * });
   */
  public defineBehaviour(callbackMap: CallbackMap<T>) {
    for (const state in callbackMap)
      this.onStateChangeTo(state, callbackMap[state]);
  }

  /**
   * Subscribes a callback to all state changes.
   * @param callback Will be called if the state of the state machine changes.
   */
  public onStateChange(callback: StateChangeCallback<T>) {
    this.genericStateChangeCallbacks.push(callback);
  }

  /**
   * Get the current state of the state machine.
   */
  public getState() {
    return this.state;
  }
}
