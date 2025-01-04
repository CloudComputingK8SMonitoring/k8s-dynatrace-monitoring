// Jonas Karg 2023

/**
 * A two-dimensional vector with the most basic vector operations.
 */
export default class Vec {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other): Vec {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  sub(other): Vec {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  mul(factor): Vec {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  div(factor): Vec {
    this.x /= factor;
    this.y /= factor;
    return this;
  }

  compDiv(other: Vec) {
    this.x /= other.x;
    this.y /= other.y;
    return this;
  }

  length(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  /**
   * Returns the square of the distance between this point and another point.
   */
  distSqr(other: Vec): number {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    return dx * dx + dy * dy;
  }

  normalize(): Vec {
    const length = this.length();
    if (length !== 0) this.div(this.length());
    return this;
  }

  clone() {
    return new Vec(this.x, this.y);
  }
}
