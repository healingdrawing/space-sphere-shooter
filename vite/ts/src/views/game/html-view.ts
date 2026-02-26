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

  return {view, container, canvas}
} 