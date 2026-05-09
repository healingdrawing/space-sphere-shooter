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

  // === UI Containers ===
  const ui_left = document.createElement('div');
  ui_left.className = 'ui-left';
  ui_left.style.display = 'none';

  const ui_right = document.createElement('div');
  ui_right.className = 'ui-right';
  ui_right.style.display = 'none';

  const ui_down = document.createElement('div');
  ui_down.className = 'ui-down';
  ui_down.style.display = 'none';

  // Main layout wrapper
  const main_row = document.createElement('div');
  main_row.style.display = 'flex';
  main_row.style.justifyContent = 'center';
  main_row.style.alignItems = 'flex-start';
  main_row.style.gap = '10px';

  main_row.append(ui_left, container, ui_right);
  view.append(main_row, ui_down);

  // Helper to create button
  const ui_button = (text: string, action: string, parent: HTMLElement) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.dataset.action = action;
    /* to kill context menu, after touch-hold-release in case of no keyboard */
    b.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
    });
    // b.style.cssText = 'padding:12px 16px; margin:3px; font-size:15px; width:60px;';
    parent.appendChild(b);
    return b;
  };

  // === Ordered Maps (arrays) ===
  const ui_left_items: [string, string][] = [
    ['W', 'CCWMOVE'], ['E', 'TOPMOVE'], ['D', 'CWMOVE'],
    ['Q', 'LEFTMOVE'], ['S', 'DOWNMOVE'], ['C', 'RIGHTMOVE'],
    ['A', 'FRONTMOVE'], ['Z', 'STOPMOVE'], ['X', 'TARGETMOVE']
  ];

  const ui_right_items: [string, string][] = [
    ['F', 'FRONTSHOT'], ['N', 'LEFTSHOT'], ['L', 'RIGHTSHOT'],
    ['K', 'BACKSHOT'], ['J', 'TOPSHOT'], ['M', 'DOWNSHOT']
  ];

  const ui_down_items: [string, string][] = [
    ['7', 'CCWMOVE'], ['8', 'TOPMOVE'], ['9', 'CWMOVE'],
    ['4', 'LEFTMOVE'], ['5', 'DOWNMOVE'], ['6', 'RIGHTMOVE'],
    ['1', 'FRONTMOVE'], ['2', 'STOPMOVE'], ['3', 'TARGETMOVE'],
    ['0', 'FRONTSHOT'], ['←', 'LEFTSHOT'], ['→', 'RIGHTSHOT'],
    ['☇', 'BACKSHOT'], ['↑', 'TOPSHOT'], ['↓', 'DOWNSHOT']
  ];

  // Fill function
  const fill_ui = (parent: HTMLElement, items: [string, string][]) => {
    let row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.justifyContent = 'center';

    items.forEach(([text, action], i) => {
      ui_button(text, action, row);
      if ((i + 1) % 3 === 0) {
        parent.appendChild(row);
        row = document.createElement('div');
        row.style.display = 'flex';
        row.style.flexWrap = 'wrap';
        row.style.justifyContent = 'center';
      }
    });
    // Add last incomplete row
    if (items.length % 3 !== 0) parent.appendChild(row);
  };

  fill_ui(ui_left, ui_left_items);
  fill_ui(ui_right, ui_right_items);
  fill_ui(ui_down, ui_down_items);
  

  return {view, container, canvas}
}
