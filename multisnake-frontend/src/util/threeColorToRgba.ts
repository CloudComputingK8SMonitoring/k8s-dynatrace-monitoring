import {Color} from "three";

/**
 * Converts a three.js color to RGBA for the use in CSS or JS canvas
 * @param color Three.js color
 * @param alpha Transparency value
 */
export default function threeColorToRGBA(color: Color, alpha: number): string {
  return `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha})`;
}
