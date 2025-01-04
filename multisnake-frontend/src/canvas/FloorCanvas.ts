import Canvas from './Canvas';
import playerDead from './FloorMessages/playerDead';
import renderHtmlToImg from '../util/renderHtmlToImg';
import State from "../state/State";
import FloorStates from "../state/FloorStates";
import Player from "../entities/Player";
import counter from "../util/counter";
import {SHORTEST_SIDE} from "../game.config";
import gameOver from "./FloorMessages/gameOver";
import GameStates from "../state/GameStates";
import time from "../util/Time";
import waitingForPlayers from "./FloorMessages/waitingForPlayers";
import {gameState} from "../state/gameState";

const CROSS_STARTING_OFFSET = Math.PI / 2;

type DrawFunction = () => void;

/**
 * This canvas is used to display the messages and other effects on the arena floor.
 */
class FloorCanvas extends Canvas {

  // Current State of the floor this is used for keeping track of
  // which messages/fx to display at any point in time.
  private readonly floorState = new State<FloorStates>(null);

  // This field contains the function that will be used in the draw() method to draw content to the canvas
  private drawFunction: DrawFunction = () => null;

  // A simple incremental counter used to keep track of the frame number.
  // This is used for the blinking of messages
  private frameCounter = counter();

  public constructor() {
    super();
  }

  public init() {

    // Here we define how the canvas reacts to changes in the floorState.
    // Essentially what happens is the draw function is set/reset to appropriate fx for each state.
    this.floorState.defineBehaviour({
      [FloorStates.WAITING_FOR_PLAYERS]: (_, img) => this.setDrawMethod(() => this.message(img)),
      [FloorStates.GAME_OVER]: (_, img) => this.setDrawMethod(() => this.message(img)),
      [FloorStates.SPINNING_CROSS]: () =>  this.setDrawMethod(this.spinningCross),
      [FloorStates.PLAYER_DEATH_MESSAGE]: (_, img) => {
        this.setDrawMethod(() => this.blinkMessage(img))
        setTimeout(() => this.floorState.setState(FloorStates.SPINNING_CROSS), 1000);
      }
    });

    // Here we define how the canvas reacts to changes from the outside game state.
    gameState.defineBehaviour({
      [GameStates.WAITING_FOR_PLAYERS]:  this.showOrUpdateWaitingForPlayersMessage.bind(this),
      [GameStates.GAME_RUNNING]:         this.showSpinningCross.bind(this),
      [GameStates.GAME_OVER]:            this.showGameOverMessage.bind(this),
    });

    this.showSpinningCross();
    this.draw();
  }

  /**
   * Overrides the draw function with the provided function
   * @param drawFunction The new draw function
   * @private
   */
  private setDrawMethod(drawFunction: DrawFunction) {
    this.drawFunction = drawFunction;
  }

  public draw() {
    this.clear();
    this.drawFunction();
  }

  /**
   * Displays "WAITING FOR PLAYERS" on the arena floor.
   * This method is async, as creating the base64 image from the HTML is also async
   */
  public async showOrUpdateWaitingForPlayersMessage() {
    const img = await renderHtmlToImg(waitingForPlayers(), this.width, this.height);
    await this.floorState.setState(FloorStates.WAITING_FOR_PLAYERS, img, true);
  }

  /**
   * Displays "PLAYER <PLAYER_NAME> HAS DIED" on the arena floor.
   * This method is async, as creating the base64 image from the HTML is also async
   */
  public async showPlayerDeathMessage(player: Player) {
    if (this.floorState.getState() === FloorStates.PLAYER_DEATH_MESSAGE) return;
    const img = await renderHtmlToImg(playerDead(player), this.width, this.height);
    await this.floorState.setState(FloorStates.PLAYER_DEATH_MESSAGE, img);
  }

  /**
   * Displays "GAME OVER" on the arena floor.
   * This method is async, as creating the base64 image from the HTML is also async
   */
  public async showGameOverMessage() {
    if (this.floorState.getState() === FloorStates.GAME_OVER) return;
    const img = await renderHtmlToImg(gameOver(), this.width, this.height);
    await this.floorState.setState(FloorStates.GAME_OVER, img);
  }

  /**
   * Displays the default arena floor animation.
   */
  public async showSpinningCross() {
    await this.floorState.setState(FloorStates.SPINNING_CROSS);
  }

  /**
   * Overriding the default clear method to clear the canvas with a non-transparent
   * color, because transparency in canvas textures will result in black surfaces in three.js
   */
  clear() {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#bbbbbb';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fill();
  }

  /**
   * The default spinning cross on the arena floor
   * @private
   */
  private spinningCross() {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = SHORTEST_SIDE * 4;

    const increment = Math.PI / 2;

    for (let i = 0; i < 4; i++) {
      let offset = time.millis() / 3000 + increment * i + CROSS_STARTING_OFFSET;
      this.ctx.moveTo(
        this.width / 2,
        this.height / 2);

      this.ctx.lineTo(
        this.width / 2 + Math.sin(offset) * this.height / 6,
        this.height / 2 + Math.cos(offset) * this.height / 6);
    }

    this.ctx.stroke();
  }

  /**
   * Displays an HTML image on the arena floor
   * @param img HTML image which will be displayed
   * @private
   */
  private message(img: HTMLImageElement) {
    this.ctx.drawImage(img, 0, 0);
  }

  /**
   * Displays a blinking HTML image on the arena floor
   * @param img HTML image which will be displayed
   * @private
   */
  private blinkMessage(img: HTMLImageElement) {
    if (this.frameCounter() % 12 <= 3) return;
    this.message(img);
  }
}

export default new FloorCanvas();
