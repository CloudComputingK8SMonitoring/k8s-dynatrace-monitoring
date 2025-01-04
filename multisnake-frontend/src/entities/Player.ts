import Vec from '../util/Vec';
import {Color, Mesh, MeshPhongMaterial, SphereGeometry} from "three";
import {
  ARENA_SIZE,
  EFFECT_VOLUME,
  MAX_PLAYER_SPEED,
  PLAYER_SIZE,
  PLAYER_STARTING_SEGMENTS,
  SEGMENTS_PER_FOOD,
  TAIL_WIDTH
} from "../game.config";
import Tail from "../Tail";
import State from "../state/State";
import MeshEntity from "./MeshEntity";
import scene from "../SceneManager";
import time from "../util/Time";
import {collisionSound} from "../sound/sounds";
import Joystick from "../control/Joystick";
import SocketJoystick from "../control/SocketJoystick";
import socketHandler from "../control/SocketHandler";
import playerManager from "../PlayerManager";

const leftBound = -ARENA_SIZE.x / 2 + PLAYER_SIZE;
const rightBound = ARENA_SIZE.x / 2 - PLAYER_SIZE;
const topBound = -ARENA_SIZE.y / 2 + PLAYER_SIZE;
const bottomBound = ARENA_SIZE.y / 2 - PLAYER_SIZE;

const distanceThreshold = Math.pow(TAIL_WIDTH, 2);

/**
 * Player represents the user-controlled game entities.
 * These entities can move around the arena and collect food.
 * This class handles Player-Player, Player-Wall and Player-Tail
 * collision detection, acceleration, velocity, friction, triggering
 * sound playback as well as reacting to changes in the game state.
 */
export default class Player extends MeshEntity {
  private readonly joystick: Joystick;
  private readonly tail: Tail;
  private readonly vel: Vec;
  readonly name: string;
  readonly id: number;
  private ready: boolean = false;

  readonly playerAlive = new State<boolean>(true);

  constructor(pos: Vec, id: number, color: Color, name: string) {
    super(pos, color);

    this.id = id;
    this.name = name;
    this.tail = new Tail(pos);
    this.vel = new Vec(0, 0);
    this.joystick = new SocketJoystick(name);

    this.tail.addSegments(PLAYER_STARTING_SEGMENTS);

    this.playerAlive.onStateChangeTo(true,  () => this.mesh.visible = true);
    this.playerAlive.onStateChangeTo(false, () => this.mesh.visible = false);

    this.update();
  }

  update() {
    // This is used for playing collision sounds
    let collisionDetected = false;

    // Acceleration using joystick
    const joystickDirection = this.joystick.getDirection();
    joystickDirection.mul(MAX_PLAYER_SPEED);
    this.applyForce(joystickDirection);

    // Adjusting the position-delta by the time-delta (to the last frame)
    // This ensures that the players remove with uniform speed independent of the framerate
    const timeAdjustedVelocity = this
      .vel.clone().mul(time.getTimeFactor());

    this.pos.add(timeAdjustedVelocity);

  playerLoop:
    for (const player of playerManager.getActivePlayers()) {
      // No collision detection necessary between a player and itself
      if (player.id === this.id) continue;

      const segments = player.tail.segments;

      // Player-Tail intersection detection
      for (let i = 1; i < segments.length; i++) {
        const intersection: boolean = this.checkSegmentIntersection(
          segments[i - 1], segments[i], this.pos);

        if (intersection) {
          playerManager.killPlayer(this);
          break playerLoop;
        }
      }

      // Player-player collision detection
      const relativePosition = this.pos.clone();
      relativePosition.sub(player.pos);
      const dist = relativePosition.length();
      const overlap = dist - PLAYER_SIZE * 2;

      if (overlap < 0) {
        // De-overlapping: move both players in opposite directions
        // by half the amount that their meshes have overlapped
        relativePosition.mul(overlap);
        player.pos.add(relativePosition);
        this.pos.sub(relativePosition);

        // Rebound
        this.vel.sub(relativePosition);
        player.vel.add(relativePosition);

        collisionDetected = true;
      }
    }

    collisionDetected ||=
      this.pos.x < leftBound || this.pos.x > rightBound ||
      this.pos.y < topBound || this.pos.y > bottomBound;

    // Player-Wall collision detection
    if (this.pos.x < leftBound) {
      this.pos.x = leftBound;
      this.vel.x *= -0.5;
    } else if (this.pos.x > rightBound) {
      this.pos.x = rightBound;
      this.vel.x *= -0.5;
    }
    if (this.pos.y < topBound) {
      this.pos.y = topBound;
      this.vel.y *= -0.5;
    } else if (this.pos.y > bottomBound) {
      this.pos.y = bottomBound;
      this.vel.y *= -0.5;
    }

    if (collisionDetected) {
      const volume = Math.min(1, this.vel.length() / MAX_PLAYER_SPEED) * EFFECT_VOLUME;
      collisionSound.play(volume);
    }

    // Friction
    this.vel.mul(1 - (0.01 * time.getTimeFactor()));

    // Could fix tail dragging (only visible on very low frame rates)
    // by updating mesh position at the start of Player.update().
    // This increases response time be one render cycle though.
    this.updateMesh();
    this.tail.update(this.pos);
  }

  /**
   * Updates the mesh to reflect potential changes in player position.
   * This is necessary, because a player is "decoupled" from its mesh.
   * i.e.: If the player position changes, the mesh does not automatically
   * change its position too.
   */
  updateMesh() {
    this.mesh.position.set(this.pos.x, PLAYER_SIZE, this.pos.y);
  }

  /**
   * Applies a force to a player.
   * Player mass is assumed as 1
   * @param force A vector representing a directional force
   */
  applyForce(force) {
    const deltaTimeAdjustedVelocity = force
      .clone().mul(time.getTimeFactor());
    this.vel.add(deltaTimeAdjustedVelocity);
  }

  /**
   * Sets the position of a player and updates the mesh position.
   * @param pos
   */
  setPosition(pos: Vec) {
    this.pos = pos;
    this.updateMesh();
  }

  /**
   * Adds tail segments and sends segment information to the game server
   */
  foodCollision() {
    this.tail.addSegments(SEGMENTS_PER_FOOD);
    socketHandler.sendSegmentMessage();
  }

  /**
   * Checks if a player has intersected a segment of the tail.
   * A segment is a line between two points v and w
   * @param v Position of the first point
   * @param w Position of the second point
   * @param playerPosition Position of the player
   */
  checkSegmentIntersection(v, w, playerPosition): boolean {
    const a = w.x - v.x;
    const b = w.y - v.y;

    const dot = (playerPosition.x - v.x) * a + (playerPosition.y - v.y) * b;
    const len_sq = a * a + b * b;

    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let dx = playerPosition.x;
    let dy = playerPosition.y;

    if (param < 0) {
      dx -= v.x;
      dy -= v.y;
    } else if (param > 1) {
      dx -= w.x;
      dy -= w.y;
    } else {
      dx -= v.x + param * a;
      dy -= v.y + param * b;
    }

    return (dx * dx + dy * dy) < distanceThreshold;
  }

  /**
   * Creates a three.js SphereGeometry, configures lighting properties and adds it to the scene.
   * This mesh will be rendered using three.js
   */
  createMesh(): Mesh {
    const geometry = new SphereGeometry(PLAYER_SIZE, 15, 15);
    const material = new MeshPhongMaterial({color: this.color});
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = this.name;
    scene.add(mesh);
    return mesh;
  }

  /**
   * Removes a mesh from the scene.
   */
  removeMesh() {
    const mesh = scene.getObjectByName(this.mesh.name);
    scene.remove(mesh);
  }

  public setReady(ready: boolean) {
    this.ready = ready;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getPos() {
    return this.pos;
  }

  public getTail() {
    return this.tail;
  }
}
