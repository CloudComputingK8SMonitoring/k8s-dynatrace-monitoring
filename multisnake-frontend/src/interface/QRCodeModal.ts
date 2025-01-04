import QRCode from 'qrcode';
import GameStates from "../state/GameStates";
import {gameState} from "../state/gameState";

const modal: HTMLDivElement = document.querySelector('#modal');
const img: HTMLImageElement = document.querySelector('#qr');

/**
 * This class controls the visibility of the HTML QR code modal that pops up
 * during the WAITING_FOR_PLAYERS phase.
 * This class needs to be instantiated once outside of this file to initialize.
 */
class QRCodeModal {
  public init() {
    this.hide();

    gameState.onStateChangeTo(GameStates.WAITING_FOR_PLAYERS, (_, code: string) => this.show(code));
    gameState.onStateChangeTo(GameStates.GAME_RUNNING, this.hide.bind(this));
  }

  private hide() {
    modal.style.opacity = '0';
  }

  private async show(code: string) {
    img.src = await QRCode.toDataURL(`multisnake.net/a?${code}`);
    modal.style.opacity = '1';
  }
}

export default new QRCodeModal();
