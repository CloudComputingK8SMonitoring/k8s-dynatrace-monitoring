import Vec from "./util/Vec";

const SCALE = 50;

export const PLAYER_STARTING_SEGMENTS = 1; // Number of tail segments at the start of the game
export const SEGMENTS_PER_FOOD = 1; // Number of tail segments added upon consuming food
export const MAX_PLAYER_SPEED = 0.05;
export const FOOD_AMOUNT = 50;

export const ARENA_SIZE = new Vec(innerWidth / SCALE, innerHeight / SCALE);
export const SHORTEST_SIDE = Math.min(ARENA_SIZE.x, ARENA_SIZE.y);
export const PLAYER_SIZE = SHORTEST_SIDE / 30;
export const FOOD_SIZE = SHORTEST_SIDE / 50;
export const ARENA_CEILING = SHORTEST_SIDE * 0.7; // Distance from arena floor to the ceiling
export const CAMERA_HEIGHT = ARENA_CEILING * 2; // Distance of camera from arena floor
export const TAIL_WIDTH = PLAYER_SIZE;
export const PLAYER_START_CIRCLE_RADIUS = SHORTEST_SIDE / 2.6;

export const MUSIC_ENABLED = true;
export const EFFECT_VOLUME = 0.4;
export const WAITING_MUSIC_VOLUME = 0.2;
