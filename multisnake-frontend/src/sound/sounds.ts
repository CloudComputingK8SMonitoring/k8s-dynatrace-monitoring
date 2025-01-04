import SingleSound from "./SingleSound";
import RepeatedSound from "./RepeatedSound";

// @ts-ignore
import collision from '../assets/sound/rebound.mp3';
// @ts-ignore
import playerDied from '../assets/sound/player-died.mp3';
// @ts-ignore
import waiting from '../assets/sound/waiting-for-players-uncropped-lq.mp3';
// @ts-ignore
import joined from '../assets/sound/player-joined.mp3';
// @ts-ignore
import gameOver from '../assets/sound/game-over.mp3';
// @ts-ignore
import gameStart from '../assets/sound/game-start.mp3';

export const collisionSound = new SingleSound(collision);
export const playerDiedSound = new SingleSound(playerDied);
export const music = new RepeatedSound(waiting);
export const joinedSound = new SingleSound(joined);
export const gameOverSound = new SingleSound(gameOver);
export const gameStartSound = new SingleSound(gameStart);
