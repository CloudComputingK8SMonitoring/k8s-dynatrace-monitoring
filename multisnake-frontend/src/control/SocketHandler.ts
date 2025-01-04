import InputHandler from "./InputHandler";
import GameStates from "../state/GameStates";
import Vec from "../util/Vec";
import {Color, ColorRepresentation} from "three";
import PlayerManager from "../PlayerManager";
import playerManager from "../PlayerManager";
import {
  SOCKET_GAME_OVER_MSG,
  SOCKET_PLAYER_DIED_PREFIX,
  SOCKET_PLAYER_DISCONNECTED_PREFIX,
  SOCKET_PLAYER_READY_PREFIX,
  SOCKET_PLAYER_REGISTERED_PREFIX,
  SOCKET_SERVER,
  SOCKET_SERVER_RECONNECT_DELAY
} from "../socket.config";
import {gameState} from "../state/gameState";

export type JoystickStates = { [name: string]: Vec };

/**
 * This class is used for communication with the game server using WebSockets.
 * The protocol that we use to encode and decode messages is defined in
 * "server-data-interface.txt" in the project root.
 * The message prefixes are specified in src/socket.config.ts
 */
class SocketHandler extends InputHandler {
  // Keeps track if the first message from the server has already been received
  private firstMessage: boolean = true;

  // This socket is used for sending/receiving data from the server
  private socket: WebSocket

  constructor() {
    super();
    this.connect();
  }

  /**
   * This method decodes messages containing joystick data.
   * @param rawData The raw data from the websocket. It should follow this scheme: "name:0.7,0.6;name:0.34,0.3;..."
   * @private
   */
  private decodeJoystickData(rawData: string): JoystickStates {
    const joystickStates: JoystickStates = {};

    rawData.split(';').map(playerData => {
      const [name, data] = playerData.split(':');
      const [x, y] = data.split(',').map(parseFloat);
      joystickStates[name] = new Vec(x, y);
    });

    return joystickStates;
  }

  /**
   * Tries to establish a socket connection and sets socket event handlers
   * @private
   */
  private connect() {

    // Try to open a socket
    console.log("Connecting ...");
    this.socket = new WebSocket(SOCKET_SERVER);

    // Connection established
    this.socket.addEventListener('open', () => console.log('Connected to the server.'));

    // Message received
    this.socket.addEventListener('message', this.handleMessage.bind(this));

    // Connection failed - retry
    this.socket.addEventListener('close', () => {
      setTimeout(this.connect.bind(this), SOCKET_SERVER_RECONNECT_DELAY);
    });
  }

  /**
   * Handle all messages from the server
   * @param data
   */
  handleMessage({ data }: MessageEvent) {
    // The first message from the server after connecting is always the game id
    // The game id is used to create the QR code for joining the game
    if (this.firstMessage) {
      this.firstMessage = false;
      gameState.setState(GameStates.WAITING_FOR_PLAYERS, data);
      return;
    }

    // Handle connecting, disconnecting and changes in player readiness
    if (gameState.getState() === GameStates.WAITING_FOR_PLAYERS) {
      const [messagePrefix, payload] = data.split(':');

      switch(messagePrefix) {
        case SOCKET_PLAYER_REGISTERED_PREFIX:
          const [name, hexColor] = payload.split(',');
          const color = new Color(hexColor as ColorRepresentation);
          PlayerManager.addPlayer(color, name);
          break;

        case SOCKET_PLAYER_DISCONNECTED_PREFIX:
          PlayerManager.removePlayer(payload);
          break;

        case SOCKET_PLAYER_READY_PREFIX:
          PlayerManager.readyPlayer(payload);
          break;
      }

      return;
    }

    // Handle any joystick data that is received when the game is running.
    if (gameState.getState() === GameStates.GAME_RUNNING) {
      const joystickStates: JoystickStates = this.decodeJoystickData(data);
      this.inputChanged(joystickStates);
    }
  }

  /**
   * Sends a list of all active players and their current number of segments to the server.
   * The format looks like this: "color:3;color:15;..."
   */
  sendSegmentMessage() {
    const parts: string[] = [];

    for (const player of playerManager.getActivePlayers()) {
      const color = player.color.getHexString();
      const nSegments = player.getTail().segments.length;

      const playerData = `${color}:${nSegments}`;
      parts.push(playerData);
    }

    this.socket.send(parts.join(';'));
  }

  /**
   * Notifies the server about the death of a player
   * The format looks like this: "died:name"
   */
  sendPlayerDeathMessage(name: string) {
    this.socket.send(`${SOCKET_PLAYER_DIED_PREFIX}:${name}`);
  }

  // Notifies the server that the game has ended
  sendGameOverMessage() {
    this.socket.send(SOCKET_GAME_OVER_MSG);
  }
}

export default new SocketHandler();
