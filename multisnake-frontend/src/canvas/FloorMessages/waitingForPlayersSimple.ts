import PlayerManager from "../../PlayerManager";
import {ARENA_SIZE, PLAYER_SIZE} from "../../game.config";
import threeColorToRGBA from "../../util/threeColorToRgba";

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
    const posY = (player.getPos().y - PLAYER_SIZE * 1.6) / ARENA_SIZE.y * 100 + 50;

    nameTags.push(`<div class="nametag nt-${id}">${name}</div>`);
    positioningStyles.push(`
      .nt-${id} {
        top: ${posY}%;
        left: ${posX}%;
        color: ${threeColorToRGBA(player.color, 1)};
      }
    `);
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
        
        #container {
          width: max-content;
          height: max-content;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .nametag {
          font-family: sans-serif;
          font-size: 3vh;
          position: absolute;
          font-weight: bolder;
          transform: translate(-50%, -100%);
          text-align: center;
        }
        
        ${positioningStyles.join('')}
      </style>
      
      <div id="container">
        <h1>WAITING</h1><br/>
        <h1>FOR</h1><br/>
        <h1>PLAYERS</h1><br/>
      </div>
      
      ${nameTags.join('')}
    </div>
  `;
};
