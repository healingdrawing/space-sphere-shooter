export const view_html_div = () => {
  
  const canvas = document.createElement('canvas');
  canvas.style.width = '400px';
  canvas.style.height = '400px';
  
  const container = document.createElement('div');
  container.id = 'game-container';
  container.className = 'w-[400px] h-[400px] mx-auto';
  container.appendChild(canvas);

  const view = document.createElement('div');
  view.id = 'game-view';
  view.className = 'view';
  view.style.display = 'none';

  const game_title = `<h2 class="text-center">Space Sphere Shooter</h2>`;
  view.innerHTML = game_title
  view.append(container);

  // todo wrap it to div and implement all the buttons + positioning + appearing only when the screen is some way mobile or device does not have physical keyboard
  const btn = document.createElement('button');
  btn.textContent = 'Front Shot';
  btn.dataset.action = 'FRONTSHOT';
  container.append(btn);

  return {view, container, canvas}
} 