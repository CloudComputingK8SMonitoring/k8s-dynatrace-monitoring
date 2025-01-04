export default () => `
<div>
  <style>
    h1 {
      font-family: sans-serif;
      font-weight: bolder;
      word-break: break-word;
      color: white;
      line-height: 30vw;
      margin: 0;
      font-size: 40vw;
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
  </style>
  
  <div id="container">
    <h1>GAME</h1><br/>
    <h1 id="color">OVER</h1>
  </div>
</div>`;
