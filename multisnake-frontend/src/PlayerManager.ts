import Player from "./entities/Player";
import {Color} from "three";
import Vec from "./util/Vec";
import getPlayerStartPositions from "./util/getPlayerStartPositions";
import floorCanvas from "./canvas/FloorCanvas";
import GameStates from "./state/GameStates";
import socketHandler from "./control/SocketHandler";
import game from "./Game";
import {gameState} from "./state/gameState";
import FloorCanvas from "./canvas/FloorCanvas";
import {joinedSound, playerDiedSound} from "./sound/sounds";
import {EFFECT_VOLUME} from "./game.config";

class PlayerManager {
  private activePlayers: Player[] = [];
  private players: Player[] = [];

  /**
   * Creates, and adds a new player to the game.
   * @param color Color of the player mesh/tail
   * @param name Name of the player
   */
  public addPlayer(color: Color, name: string) {
    if (gameState.getState() !== GameStates.WAITING_FOR_PLAYERS) {
      console.error("Refused to add player before/after WAITING_FOR_PLAYERS state");
      return;
    }

    console.log(`Player ${name} joined`);

    const newPlayerIndex = this.players.length;
    const player = new Player(new Vec(0, 0), newPlayerIndex, color, name);
    this.players.push(player);

    this.adjustPlayerStartPositions();
    FloorCanvas.showOrUpdateWaitingForPlayersMessage();
    joinedSound.play(EFFECT_VOLUME);
  }

  /**
   * Removes a player from the game
   * @param name
   */
  public removePlayer(name: string) {
    console.log(`Player ${name} disconnected`);

    this.players = this.players.filter(player => {
      if (player.name === name) {
        player.removeMesh();
        return false;
      }

      return true;
    });

    if (gameState.getState() === GameStates.WAITING_FOR_PLAYERS) {
      this.adjustPlayerStartPositions();
      FloorCanvas.showOrUpdateWaitingForPlayersMessage();
      joinedSound.play(EFFECT_VOLUME);
    }
  }

  /**
   * Removes a player from the list of active players and hides the player mesh
   * @param player Player instance to be killed
   */
  killPlayer(player: Player) {
    this.activePlayers = this.activePlayers.filter(({id}) => id != player.id);
    player.playerAlive.setState(false);

    if (this.activePlayers.length == 1) {
      game.gameOver();
      return;
    }

    playerDiedSound.play(EFFECT_VOLUME);
    floorCanvas.showPlayerDeathMessage(player);
    socketHandler.sendPlayerDeathMessage(player.name);
  }

  /**
   * Makes all players "active".
   * This enables player joystick control, collision detection and game stat broadcasting.
   */
  activatePlayers() {
    this.activePlayers = [...this.getPlayers()];
  }

  /**
   * This method places players at their start positions.
   * This should be called when the number of players changes
   * during the WAITING_FOR_PLAYERS state
   * @private
   */
  private adjustPlayerStartPositions() {
    const playerPositions = getPlayerStartPositions(this.players.length);

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].setPosition(playerPositions[i]);
    }
  }

  /**
   * Marks a player a "ready to play"
   * @param name Name of the player
   */
  readyPlayer(name: string) {
    for (const player of this.players) {
      if (player.name === name) {
        player.setReady(true);
        break;
      }
    }

    console.log(`Player ${name} ready`);

    const allPlayersReady: boolean = this.players.every(player => player.isReady());

    if (allPlayersReady && this.players.length > 1) {
      console.log('All players ready!');
      socketHandler.sendSegmentMessage();
      gameState.setState(GameStates.GAME_RUNNING);
    }
  }

  public getPlayers() {
    return this.players;
  }

  public getActivePlayers() {
    return this.activePlayers;
  }
}

export default new PlayerManager();