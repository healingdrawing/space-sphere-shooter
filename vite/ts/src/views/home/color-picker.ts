export function color_picker() {
  /** hex color #000000 default */
  let color = {r:0, g:0, b:0}
  
  let widget = document.createElement('div')
  widget.style.cssText = "border:3px solid gray;display: flex;flex-direction: column;align-items: center;" //warning implement properly, it is just for test

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  canvas.style.border = "3px solid gray"
  const ctx = canvas.getContext('2d')!;

  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      const hue = (x / 256) * 360;
      const lightness = 1 - (y / 256);
      const saturation = 1;
      const color = hslToRgb(hue, saturation, lightness);
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  const demobox = document.createElement('div');
  demobox.style.width = '256px';
  demobox.style.height = '80px';
  demobox.style.marginTop = '12px';
  demobox.style.border = '3px solid #333';
  demobox.style.backgroundColor = '#000000'; // default black
  demobox.style.borderRadius = '8px';

  widget.appendChild(canvas)
  widget.appendChild(demobox)

  canvas.addEventListener('pointerup', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hue = (x / canvas.width) * 360;
    const lightness = 1 - (y / canvas.height);
    console.log(`Selected: hsl(${hue}, 100%, ${lightness * 100}%)`);

    const rgb = hslToRgb(hue, 1, lightness);
    // const color_string = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    color = rgb
    console.log("rgb:",rgb)
    console.log("game_color:",color)
    demobox.style.backgroundColor = rgbToHex(rgb.r, rgb.g, rgb.b);
    

  });

  return {
    widget,
    get color() {
      return color;
    }
  }
}

// Helper
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

/** 0-255 */
function rgbToHex(r:number, g:number, b:number) {
  const toHex = (c:number) => {
      const hex = Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0');
      return hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`; // Use r, g, b directly
}

// function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
//   hex = hex.replace(/^#/, '');
//   if (hex.length === 3) {
//       hex = hex.split('').map(char => char + char).join('');
//   }
//   if (hex.length !== 6) {
//       return null;
//   }
//   const r = parseInt(hex.substring(0, 2), 16);
//   const g = parseInt(hex.substring(2, 4), 16);
//   const b = parseInt(hex.substring(4, 6), 16);
//   return { r, g, b };
// }