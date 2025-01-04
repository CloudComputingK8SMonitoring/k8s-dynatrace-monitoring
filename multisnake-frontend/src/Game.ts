import GameStates from "./state/GameStates";
import {gameState} from "./state/gameState";
import socketHandler from "./control/SocketHandler";
import playerManager from "./PlayerManager";
import foodManager from "./FoodManager";
import {gameOverSound, gameStartSound, music} from "./sound/sounds";
import {EFFECT_VOLUME, MUSIC_ENABLED, WAITING_MUSIC_VOLUME} from "./game.config";

/**
 * Main game class. Handles food and players.
 */
class Game {
  private gameId: string;

  public init() {
    gameState.defineBehaviour({
      [GameStates.GAME_RUNNING]:         this.startGame,
      [GameStates.WAITING_FOR_PLAYERS]:  this.waitForPlayers.bind(this),
    });
  }

  private waitForPlayers(_, gameId: string) {
    this.gameId = gameId;
    if (MUSIC_ENABLED) {
      setTimeout(() => {
        music.play(WAITING_MUSIC_VOLUME);
      }, 2000);
    }
  }


  public startGame() {
    playerManager.activatePlayers();
    foodManager.spawnFood();
    gameStartSound.play(EFFECT_VOLUME);
  }

  public gameOver() {
    gameState.setState(GameStates.GAME_OVER);
    socketHandler.sendGameOverMessage();
    music.stop();
    gameOverSound.play(EFFECT_VOLUME);
  }

  /**
   * Updates all players and food items
   */
  public update() {
    for (const player of playerManager.getActivePlayers()) player.update();
    for (const food of foodManager.getFood()) food.update();
  }
}

export default new Game();
