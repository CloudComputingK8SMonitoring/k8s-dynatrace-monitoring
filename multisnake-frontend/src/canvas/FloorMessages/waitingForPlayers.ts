import PlayerManager from "../../PlayerManager";
import {ARENA_SIZE, PLAYER_SIZE} from "../../game.config";
import threeColorToRGBA from "../../util/threeColorToRgba";

const NAME_TAG_AMOUNT = 3;
const RADIUS_CONSTANT = 5;

/**
 * This function returns some HTML code which will be used to render the
 * "WAITING FOR PLAYERS" text and player name-tags during the WAITING_FOR_PLAYERS phase.
 */
export default () => {

  const nameTags: string[] = [];
  const positioningStyles: string[] = [];

  // Generates a player tag along with appropriate CSS for each player
  for (const player of PlayerManager.getPlayers()) {
    const id = player.id;
    const name = player.name.replace(' ', '<br/>');

    const posX = player.getPos().x / ARENA_SIZE.x * 100 + 50;
    const posY = player.getPos().y / ARENA_SIZE.y * 100 + 50;

    const step = Math.PI * 2 / NAME_TAG_AMOUNT;
    const radius = PLAYER_SIZE * ARENA_SIZE.y * RADIUS_CONSTANT;
    let tags = '';
    let style = '';

    for (let i = 0; i < NAME_TAG_AMOUNT; i++) {
      const angle = step * i;
      const rAngle = angle + Math.PI / 2;
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;

      style += `
        .nt-${id}.id-${i} {
          top: ${posY}%;
          left: ${posX}%;
          color: ${threeColorToRGBA(player.color, 1)};
          transform: translate(calc(${offsetX}px - 50%), calc(${offsetY}px - 50%)) rotate(${rAngle}rad);
        }
      `;

      tags += `<div class="nametag nt-${id} id-${i}">${name}</div>`;
    }

    nameTags.push(tags);
    positioningStyles.push(style);
  }

  return `
    <div>
      <style>
        h1 {
          font-family: sans-serif;
          font-weight: bolder;
          word-break: break-word;
          color: white;
          line-height: 20vw;
          margin: 0;
          font-size: 20vw;
          display: inline;
          text-shadow: calc(1vw) calc(1vw) rgba(0, 0, 0, 0.1);
        }
        
        #color {
          color: #ff0000;
        }
        
        #big-text {
          width: max-content;
          height: max-content;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .nametag {
          font-family: sans-serif;
          font-size: 2vh;
          position: absolute;
          font-weight: bolder;
          text-align: center;
        }
        
        ${positioningStyles.join('')}
      </style>
      
      <div id="big-text">
        <h1>WAITING</h1><br/>
        <h1>FOR</h1><br/>
        <h1>PLAYERS</h1><br/>
      </div>
      
      ${nameTags.join('')}
    </div>
  `;
};
