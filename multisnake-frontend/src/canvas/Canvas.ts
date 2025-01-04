/**
 * This class represents a canvas which can be drawn to
 * using the provided CanvasRenderingContext.
 */
export default abstract class Canvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  protected constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.width = innerWidth;
    this.height = innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  /**
   * Clears the canvas with a transparent color.
   * This should be called before drawing the next frame.
   */
  clear() {
    this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }

  /**
   * This method will be called approximately 60 times per second in the scene's main update method.
   */
  abstract draw();

  /**
   * Returns the HTMLCanvasElement
   */
  getCanvas() {
    return this.canvas;
  }
}
