import Vec from "./Vec";
import {PLAYER_START_CIRCLE_RADIUS} from "../game.config";

/**
 * Returns a list of n points arranged in a circle around (0,0).
 * This is used to position the players during the WAITING_FOR_PLAYERS phase.
 * @param n
 */
export default function getPlayerStartPositions(n: number): Vec[] {
  const step = 2 * Math.PI / n;
  const positions: Vec[] = [];

  for (let i = 0; i < n; i++) {
    const pos = new Vec(
      Math.cos(i * step),
      Math.sin(i * step)
    );

    pos.mul(PLAYER_START_CIRCLE_RADIUS);
    positions.push(pos);
  }

  return positions;
}
