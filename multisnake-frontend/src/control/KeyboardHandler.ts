import InputHandler from "./InputHandler";

/**
 * Represents a map of all currently pressed keys
 */
type PressedKeysLookup = { [key: string]: boolean };

/**
 * This class tracks changes to a keyboard's currently pressed keys.
 * This is useful for any keyboard control of a player.
 * This class is only used in the keyboard demo.
 */
export default class KeyboardHandler extends InputHandler {
  protected pressed: PressedKeysLookup = {};

  constructor() {
    super();

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    window.addEventListener('keyup', (event) => {
      this.handleKeyUp(event);
    });
  }

  handleKeyDown(event) {
    if (!this.pressed[event.key]) {
      this.pressed[event.key] = true;
      this.inputChanged(event);
    }
  }

  handleKeyUp(event) {
    if (this.pressed[event.key]) {
      delete this.pressed[event.key];
      this.inputChanged(event);
    }
  }

  public getPressed() {
    return this.pressed;
  }
}
