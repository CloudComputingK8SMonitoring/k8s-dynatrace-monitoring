import Vec from "./util/Vec";

const MAX_SEGMENT_DISTANCE = 0.5;

/**
 * Contains a list of points which make up the segments of each players tail
 * as well as methods for adding segments and updating the segment positions.
 */
export default class Tail {

  readonly segments: Vec[];

  constructor(initialPosition: Vec) {
    this.segments = [initialPosition];
  }

  /**
   * Updates the segments of the tail.
   * @param playerPosition Current position of the player
   */
  public update(playerPosition: Vec) {
    this.segments[0] = playerPosition.clone();

    // This is essentially a simulation of a rope
    for (let i = 1; i < this.segments.length; i++) {
      // Compute the displacement of the current segment from the previous
      const delta = this.segments[i - 1]
        .clone().sub(this.segments[i]);

      const length = delta.length();

      if (length <= MAX_SEGMENT_DISTANCE) break;
      delta.div(length / MAX_SEGMENT_DISTANCE);

      this.segments[i] = this.segments[i - 1]
        .clone().sub(delta);
    }
  }

  /**
   * Add n new segments to the tail
   * @param n number of segments
   */
  public addSegments(n: number) {
    for (let i = 0; i < n; i++) {
      const lastSegment = this.segments[this.segments.length - 1].clone();
      this.segments.push(lastSegment);
    }
  }
}
