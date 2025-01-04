import Player from "../../entities/Player";
import threeColorToRGBA from "../../util/threeColorToRgba";

export default ({name, color}: Player) => `
<div>
  <style>
    h1 {
      font-family: sans-serif;
      font-weight: bolder;
      word-break: break-word;
      color: white;
      font-size: 25vh;
      line-height: 25vh;
      margin: 0 0 0 2vh;
    }
    
    #color {
      color: ${threeColorToRGBA(color, 1)};
    }
    
    #container {
      width: inherit;
    }
  </style>
  
  <div id="container">
    <h1>PLAYER</h1>
    <h1 id="color">${name}</h1>
    <h1>HAS</h1>
    <h1>DIED</h1>
  </div>
</div>`;
