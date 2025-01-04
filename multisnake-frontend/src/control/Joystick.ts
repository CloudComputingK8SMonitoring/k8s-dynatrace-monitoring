import Vec from "../util/Vec";

/**
 * This interface represents any device that can be used a joystick.
 * The current Joystick data, in the form a Vector can be obtained by calling getDirection()
 */
export default interface Joystick {

  /**
   * Returns the current direction of the joystick.
   */
  getDirection(): Vec;
}
