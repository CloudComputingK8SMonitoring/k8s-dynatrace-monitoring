import State from "./State";
import GameStates from "./GameStates";

// The topmost state. Everything reacts to changes of gameState.
export const gameState = new State<GameStates>(GameStates.WAITING_FOR_GAME_ID);
