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

  /*
    grok , refactor from this place.
    The format is next:
    - do not touch the styles as possible at first step(later will fix it)
    - the structure is 
    1 - div class=ui-left | div id=game-container | div class=ui-right (when ui shown then all in one line from left to right. each ui div has x3 buttons in each row)
    2 - div class=ui-down (placed below on next line after x3 above. div has x3 buttons in each row)
    3 - create buttons in for loop, and function inside loop ui_button(text, action, ui_container_****)
    buttons map
    key(button text):value(dataset.action)
    - ui_left_map:
    W:CCWMOVE
    E:TOPMOVE
    D:CWMOVE
    Q:LEFTMOVE
    S:DOWNMOVE
    C:RIGHTMOVE
    A:FRONTMOVE
    Z:STOPMOVE
    X:TARGETMOVE
    - ui_right_map:
    F:FRONTSHOT
    N:LEFTSHOT
    L:RIGHTSHOT
    K:BACKSHOT
    J:TOPSHOT
    M:DOWNSHOT

    - ui_down_map:
    7:CCWMOVE
    8:TOPMOVE
    9:CWMOVE
    4:LEFTMOVE
    5:DOWNMOVE
    6:RIGHTMOVE
    1:FRONTMOVE
    2:STOPMOVE
    3:TARGETMOVE
    0:FRONTSHOT
    ←:LEFTSHOT
    →:RIGHTSHOT
    ☇:BACKSHOT
    ↑:TOPSHOT
    ↓:DOWNSHOT

    create x3 maps above , and use them to fill x3 divs uses buttons. x3 button in each row

  */

  // view.append(container);

  // const btn = document.createElement('button');
  // btn.textContent = 'Front Shot';
  // btn.dataset.action = 'FRONTSHOT';
  // container.append(btn);

  // === UI Containers ===
  const uiLeft = document.createElement('div');
  uiLeft.className = 'ui-left';
  uiLeft.style.display = 'none';

  const uiRight = document.createElement('div');
  uiRight.className = 'ui-right';
  uiRight.style.display = 'none';

  const uiDown = document.createElement('div');
  uiDown.className = 'ui-down';
  uiDown.style.display = 'none';

  // Main layout wrapper
  const mainRow = document.createElement('div');
  mainRow.style.display = 'flex';
  mainRow.style.justifyContent = 'center';
  mainRow.style.alignItems = 'flex-start';
  mainRow.style.gap = '10px';

  mainRow.append(uiLeft, container, uiRight);
  view.append(mainRow, uiDown);

  // Helper to create button
  const ui_button = (text: string, action: string, parent: HTMLElement) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.dataset.action = action;
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
  const fillUI = (parent: HTMLElement, items: [string, string][]) => {
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

  fillUI(uiLeft, ui_left_items);
  fillUI(uiRight, ui_right_items);
  fillUI(uiDown, ui_down_items);
  

  return {view, container, canvas}
}
