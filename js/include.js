<!-- include.js -->
<script>
(function(){
  const ph = document.querySelector('[data-include="header.html"]') || document.getElementById('site-header');
  if(!ph) return;

  const url = ph.getAttribute('data-include') || 'header.html';

  // Prefer fetch-inject (keeps sticky header in page DOM). Fallback to iframe for file://
  fetch(url, {cache:'no-store'})
    .then(r => r.text())
    .then(html => {
      ph.outerHTML = html;
    })
    .catch(() => {
      // Fallback for file:// (or any fetch problem): iframe with active param
      const here = (location.pathname.split('/').pop() || 'index.html');
      const iframe = document.createElement('iframe');
      iframe.src = url + '?active=' + encodeURIComponent(here);
      iframe.className = 'header-iframe';
      // Replace placeholder
      ph.replaceWith(iframe);
    });
})();
// === User Background Color Picker Feature ===

// Wait until the page is ready
document.addEventListener("DOMContentLoaded", function() {
  const colorPicker = document.getElementById('bgPicker');
  const savedColor = localStorage.getItem('userBgColor');

  // Apply saved background on load
  if (savedColor) {
    document.body.style.backgroundColor = savedColor;
    if (colorPicker) colorPicker.value = savedColor;
  }

  // Listen for new color selections
  if (colorPicker) {
    colorPicker.addEventListener('input', (event) => {
      const color = event.target.value;
      document.body.style.backgroundColor = color;
      localStorage.setItem('userBgColor', color);
    });
  }
});<script>
/* ---------- helpers ---------- */
function hexToRgb(hex){
  hex = hex.replace('#','').trim();
  if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const num = parseInt(hex,16);
  return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
}
function rgbStringToRgb(str){ // handles 'rgb(...)' or 'rgba(...)'
  const m = str.match(/rgba?\(([^)]+)\)/i);
  if(!m) return null;
  const [r,g,b] = m[1].split(',').map(s=>parseFloat(s));
  return {r,g,b};
}
function relLuminance({r,g,b}){
  // sRGB -> linear
  const srgb = [r,g,b].map(v=>{
    v/=255;
    return v<=0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  // WCAG relative luminance
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}
function parseColorToRgb(c){
  if(!c) return null;
  c = c.trim();
  if(c.startsWith('#')) return hexToRgb(c);
  if(c.startsWith('rgb')) return rgbStringToRgb(c);
  return null; // keep it simple for now (could add hsl parser if you use it)
}

/* ---------- core: choose black/white that contrasts with bg ---------- */
function pickContrastingBW(bgColor){
  const rgb = parseColorToRgb(bgColor);
  if(!rgb) return '#000'; // fallback
  const L = relLuminance(rgb);
  // If background is light, use black tabs; if dark, use white tabs
  return L > 0.5 ? '#000' : '#fff';
}

/* ---------- apply tab colors ---------- */
function applyTabColors({tabBg, tabFg}){
  const root = document.documentElement.style;
  if (tabBg) root.setProperty('--tab-bg', tabBg);
  if (tabFg) root.setProperty('--tab-fg', tabFg);
}

/* Public: Force black tabs with white text */
window.setTabsBlack = function(){
  applyTabColors({ tabBg: '#000000', tabFg: '#ffffff' });
};

/* Public: Auto black/white based on page background */
window.setTabsAuto = function(){
  // Try CSS var --bg first, then computed body background
  const rootStyles = getComputedStyle(document.documentElement);
  let bg = rootStyles.getPropertyValue('--bg').trim();
  if(!bg){
    bg = getComputedStyle(document.body).backgroundColor;
  }
  const tabFg = pickContrastingBW(bg);          // text color for tab
  const tabBg = tabFg === '#000' ? '#ffffff'    // opposite for background
                                 : '#111111';
  applyTabColors({ tabBg, tabFg });
};

/* ---------- live updates when your bg color picker changes ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // Run once on load (auto mode by default)
  window.setTabsAuto();

  // If you have a background picker with id="bgPicker", update tabs as it changes
  const picker = document.getElementById('bgPicker');
  if (picker) {
    picker.addEventListener('input', () => {
      // if you also set body background from this picker, do that here:
      // document.body.style.backgroundColor = picker.value;
      // then update tab contrast:
      const tabFg = pickContrastingBW(picker.value);
      const tabBg = tabFg === '#000' ? '#fff' : '#111';
      applyTabColors({ tabBg, tabFg });
    });
  }
});
</script>
<label for="bgPicker">Background:</label>
<input type="color" id="bgPicker" value="#ffffff"></input>
</script>
