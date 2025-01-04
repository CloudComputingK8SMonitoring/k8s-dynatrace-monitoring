import MeshEntity from "./MeshEntity";
import Vec from "../util/Vec";
import {ARENA_SIZE, FOOD_SIZE, PLAYER_SIZE} from "../game.config";
import {BoxGeometry, Color, Mesh, MeshPhongMaterial} from "three";
import scene from "../SceneManager";
import playerManager from "../PlayerManager";

// This constant is used for collision detection.
// Having this constant allows us to avoid calling Math.sqrt(),
// which is quite computationally expensive.
const PLAYER_SIZE_SQR = Math.pow(PLAYER_SIZE, 2);

/**
 * The white, cube-shaped food items that the players can pick up.
 */
export default class FoodEntity extends MeshEntity {

  // Initial orientation upon spawning
  private readonly rotation = new Vec(
    (Math.random() - 0.5) * 0.06,
    (Math.random() - 0.5) * 0.06
  );

  constructor() {
    const position = new Vec();
    const color = new Color(1, 1, 1);
    super(position, color);

    this.respawn();
  }

  update() {
    // Player-FoodEntity collision detection
    for (const player of playerManager.getActivePlayers()) {
      if (this.pos.distSqr(player.getPos()) < PLAYER_SIZE_SQR) {
        this.respawn();
        player.foodCollision();
      }
    }

    this.mesh.rotation.y += this.rotation.y;
    this.mesh.rotation.z += this.rotation.x;
  }

  /**
   * Respawns the food item to a random location
   */
  respawn() {
    this.pos = new Vec(
      (Math.random() - 0.5) * (ARENA_SIZE.x - PLAYER_SIZE * 2),
      (Math.random() - 0.5) * (ARENA_SIZE.y - PLAYER_SIZE * 2)
    );

    this.mesh.position.set(this.pos.x, PLAYER_SIZE / 2, this.pos.y);
  }

  createMesh(): Mesh {
    const geometry = new BoxGeometry(FOOD_SIZE, FOOD_SIZE, FOOD_SIZE);
    const material = new MeshPhongMaterial({color: this.color});
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.rotation.set(Math.PI / 4, Math.PI / 4, Math.random() * Math.PI);
    scene.add(mesh);
    return mesh;
  }
}
