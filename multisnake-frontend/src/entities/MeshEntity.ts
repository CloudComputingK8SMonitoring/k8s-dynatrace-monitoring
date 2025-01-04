import Vec from "../util/Vec";
import {Color, Mesh} from "three";
import Entity from "./Entity";

/**
 * This class represents any entity that has a three.js mesh (Player, FoodEntity)
 */
export default abstract class MeshEntity extends Entity {
  protected mesh: Mesh;

  protected constructor(pos: Vec, color: Color) {
    super(pos, color);
    this.mesh = this.createMesh();
  }

  /**
   * Used for creating the three.js mesh that will be rendered.
   */
  abstract createMesh(): Mesh;
}
