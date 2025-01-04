import Vec from "../util/Vec";
import Joystick from "./Joystick";
import socketHandler, {JoystickStates} from "./SocketHandler";

/**
 * This class represents a "virtual joystick" that receives its data from
 * the socketHandler instead of a keyboard or other physical device.
 */
export default class SocketJoystick implements Joystick {

  private currentState: Vec = new Vec(0, 0);
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
    socketHandler.subscribe(this.update.bind(this));
  }

  /**
   * Updates the joysticks current state with the provided data
   * @param joystickStates a map which maps a username to their current joystick direction vector
   * @private
   */
  private update(joystickStates: JoystickStates) {
    // The zero vector acts a fallback so that the game
    // does not crash if there is a player with a name mismatch.
    this.currentState = joystickStates[this.name] || new Vec(0, 0);
  }

  getDirection(): Vec {
    return this.currentState;
  }
}
