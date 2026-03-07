import * as BABYLON from 'babylonjs' // log version below prevents build error with strict requirements for typescript configuration
import './style.css'
import './vs-modal.css'
import { big_box } from './views/bigbox'



// Append views to app
(async () => {
  await BABYLON.InitializeCSG2Async();
  const app = document.querySelector('#app')!
  app.append(big_box.home_box.view, big_box.game_box.view);
  console.log("BABYLON:", BABYLON.Engine.Version); //warning must be, do not remove
})();
