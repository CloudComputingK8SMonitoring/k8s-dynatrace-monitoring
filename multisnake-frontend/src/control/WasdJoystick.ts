import KeyboardHandler from './KeyboardHandler';
import Vec from '../util/Vec';
import Joystick from './Joystick';

/**
 * This class represents a joystick that is controlled by the WASD keyboard keys.
 */
export default class WasdJoystick implements Joystick {

  keyHandler: KeyboardHandler = new KeyboardHandler();

  wasdJoystickReference = {
    'w': new Vec(0, -1),
    'a': new Vec(-1, 0),
    's': new Vec(0, 1),
    'd': new Vec(1, 0),
  };

  getDirection(): Vec {
    const dir = new Vec(0, 0);

    for (const key in this.keyHandler.getPressed()) {
      const component = this.wasdJoystickReference[key.toLowerCase()];
      if (component) dir.add(component);
    }

    dir.normalize();

    return dir;
  }
}
