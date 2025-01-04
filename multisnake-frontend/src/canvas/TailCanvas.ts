import {ARENA_SIZE, TAIL_WIDTH} from '../game.config';
import Canvas from './Canvas';
import threeColorToRGBA from "../util/threeColorToRgba";
import playerManager from "../PlayerManager";

/**
 * This canvas is used to draw the tails of the snakes
 */
class TailCanvas extends Canvas {

  /**
   * The default constructor is overridden to apply some additional
   * scaling and canvas configs such that the player tails can
   * simply be drawn using a single polyline per tail.
   */
  constructor() {
    super();

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = TAIL_WIDTH;

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.width / ARENA_SIZE.x, this.height / ARENA_SIZE.y);
  }

  /**
   * Draws each player's tails to the canvas
   */
  draw() {
    this.clear();

    // Draw the tail of each player as a polyline of the line segment positions
    for (const player of playerManager.getActivePlayers()) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = threeColorToRGBA(player.color, 1);

      this.ctx.moveTo(player.getPos().x, player.getPos().y);

      for (const segment of player.getTail().segments) {
        this.ctx.lineTo(segment.x, segment.y);
      }

      this.ctx.stroke();
    }
  }
}

export default new TailCanvas();
