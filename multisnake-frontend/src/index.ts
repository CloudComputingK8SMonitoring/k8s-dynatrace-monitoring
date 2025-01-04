import floorCanvas from "./canvas/FloorCanvas";
import qrCodeModal from "./interface/QRCodeModal";
import game from "./Game";
import {sceneManager} from "./SceneManager";

// Calling init() makes the instances responsive to state changes
qrCodeModal.init()
floorCanvas.init();
game.init();
sceneManager.init();
