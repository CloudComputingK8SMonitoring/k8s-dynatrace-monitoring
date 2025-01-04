import Entity from "./Entity";
import Vec from "../util/Vec";
import {Color, PointLight} from "three";
import scene from "../SceneManager";
import {ARENA_SIZE, SHORTEST_SIDE} from "../game.config";
import GameStates from "../state/GameStates";
import time from "../util/Time";

import {gameState} from "../state/gameState";

/**
 * MovingPointLight is a wrapper of THREE.PointLight which
 * reacts to changes in the current game state.
 */
export default class MovingPointLight extends Entity {
  private readonly pointLight: PointLight;
  public update: () => void = this.circleAround;

  constructor() {
    super(new Vec(), new Color(1, 1, 1));

    this.pointLight = new PointLight(this.color, 0.6, 0, 2);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.x = 1024;
    this.pointLight.shadow.mapSize.y = 1024;

    scene.add(this.pointLight);

    gameState.defineBehaviour({
      [GameStates.GAME_RUNNING]: () => this.update = this.circleAround,
      [GameStates.GAME_OVER]:    () => this.update = this.redGlow,
    });
  }

  /**
   * Moves the PointLight in circles above the arena and smoothly changes the light color
   */
  circleAround() {
    this.pointLight.position.set(
      Math.cos(time.millis() / 1500) * SHORTEST_SIDE / 2,
      6,
      Math.sin(time.millis() / 3000) * SHORTEST_SIDE / 2
    );

    const color = new Color(
      Math.sin(time.millis() / 1000) * 0.5 + 0.5,
      Math.sin(time.millis() / 1000 + Math.PI / 2) * 0.5 + 0.5,
      Math.sin(time.millis() / 1000 + Math.PI / 4) * 0.5 + 0.5);

    this.pointLight.color.set(color);
  }

  /**
   * Static red glow from the top left corner of the arena
   */
  redGlow() {
    this.pointLight.position.set(
      -ARENA_SIZE.x / 4,
      6,
      -ARENA_SIZE.y / 4
    );

    const color = new Color(1, 0, 0);

    this.pointLight.color.set(color);
  }
}
