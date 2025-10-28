<script>
(() => {
  const SITE_KEY = 'mlcs_theme_site';
  const PAGE_KEY = p => `mlcs_theme_page:${p}`;
  const DEFAULT  = { mode: 'color', color: '#63b3ed', image: '' }; // light ocean blue

  // Current file (e.g., "index.html")
  const CURRENT = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  // Expose an apply function so the settings page can repaint itself immediately after saving.
  function applyTheme(t = DEFAULT) {
    const body = document.body;
    // clear first
    body.style.background = '';
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundAttachment = '';
    body.style.backgroundPosition = '';
    body.style.backgroundRepeat = '';
    body.classList.remove('theme-color','theme-image');

    if (t.mode === 'image' && t.image) {
      body.style.backgroundImage = `url(${t.image})`;
      body.style.backgroundSize = 'cover';
      body.style.backgroundAttachment = 'fixed';
      body.style.backgroundPosition = 'center';
      body.style.backgroundRepeat = 'no-repeat';
      body.classList.add('theme-image');
    } else {
      body.style.background = t.color || DEFAULT.color;
      body.classList.add('theme-color');
    }
  }

  // Pick the theme for THIS PAGE (page overrides sitewide → default)
  function loadThemeForCurrentPage() {
    const siteTheme = safeRead(SITE_KEY);
    const pageTheme = safeRead(PAGE_KEY(CURRENT));
    return pageTheme || siteTheme || DEFAULT;
  }

  function safeRead(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }

  // Initial paint
  applyTheme(loadThemeForCurrentPage());

  // Live updates when storage changes (e.g., you save from settings page)
  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    // repaint if sitewide changed, or if this page's theme changed
    if (e.key === SITE_KEY || e.key === PAGE_KEY(CURRENT)) {
      applyTheme(loadThemeForCurrentPage());
    }
  });

  // Make available to other scripts:
  window.MLCS_applyTheme = applyTheme;
  window.MLCS_themeKeys = { SITE_KEY, PAGE_KEY, DEFAULT, CURRENT };
})();
</script>