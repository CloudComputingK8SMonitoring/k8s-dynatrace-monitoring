import Vec from "../util/Vec";
import {Color} from "three";

/**
 * This class represents a game entity (Players, FoodEntity, Lights)
 * All entities have a position, a color and an update method.
 */
export default abstract class Entity {
  readonly color: Color;
  protected pos: Vec;

  protected constructor(pos: Vec, color: Color) {
    this.pos = pos;
    this.color = color;
  }

  /**
   * Used to update entity fields and detect collisions.
   * @param millis Elapsed time since game initialization
   */
  abstract update(millis?: number): void;
}
