(() => {
    const cfg = window.LCP_SEARCH_CONFIG || {};
    const CACHE_VERSION = cfg.cacheVersion || 'v1';
    const storeKey = `lcpSearchCache:${CACHE_VERSION}`;
    const debounce = (fn, ms=200) => {
      let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); };
    };
  
    // --- UI skeleton ---
    const root = document.createElement('div');
    root.className = 'lcp-search-root';
    root.innerHTML = `
      <button class="lcp-search-fab" aria-label="Search" title="Search ( / )">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
          <path d="M20 20L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      </button>
      <div class="lcp-search-wrap">
        <input class="lcp-search-input" type="search" placeholder="Search site..." aria-label="Search site">
      </div>
    `;
    const results = document.createElement('div');
    results.className = 'lcp-search-results';
    document.body.append(root, results);
  
    const fab = root.querySelector('.lcp-search-fab');
    const wrap = root.querySelector('.lcp-search-wrap');
    const input = root.querySelector('.lcp-search-input');
  
    const open = () => { wrap.classList.add('open'); input.focus(); };
    const close = () => { wrap.classList.remove('open'); results.classList.remove('show'); results.innerHTML = ''; input.value=''; };
  
    fab.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // quick open with '/'
        e.preventDefault(); open();
      } else if (e.key === 'Escape') {
        close();
      }
    });
  
    // --- Index sources ---
    async function loadPageList() {
      // A) preferred: fetch /pages.json
      if (cfg.indexUrl) {
        try {
          const res = await fetch(cfg.indexUrl, { credentials: 'same-origin' });
          if (res.ok) return await res.json();
        } catch {}
      }
      // B) fallback: find <a data-path="..."> in your <nav>
      const links = [...document.querySelectorAll('nav a[data-path]')];
      const seen = new Set();
      const list = [];
      links.forEach(a=>{
        const url = new URL(a.getAttribute('data-path'), location.href).pathname;
        if (!seen.has(url)) { seen.add(url); list.push({ url, title: a.textContent.trim() || url }); }
      });
      // include current page
      if (!seen.has(location.pathname)) list.push({ url: location.pathname, title: document.title || location.pathname });
      return list;
    }
  
    function strip(html) {
      const tmp = document.createElement('div'); tmp.innerHTML = html;
      // remove script/style/nav/footer/aside
      tmp.querySelectorAll('script,style,noscript,nav,footer,aside').forEach(el=>el.remove());
      return (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    }
  
    async function fetchText(url) {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('fetch failed');
      const html = await res.text();
      return strip(html);
    }
  
    // cache in localStorage to avoid re-fetching every keystroke
    async function buildIndex(pages) {
      const cached = localStorage.getItem(storeKey);
      if (cached) {
        try { const parsed = JSON.parse(cached); if (Array.isArray(parsed)) return parsed; } catch {}
      }
      const index = [];
      for (const p of pages) {
        try {
          const txt = await fetchText(p.url);
          index.push({ url: p.url, title: p.title || p.url, text: txt });
        } catch {
          // ignore fetch errors (404 pages etc.)
        }
      }
      localStorage.setItem(storeKey, JSON.stringify(index));
      return index;
    }
  
    function highlightSnippet(text, q, len=140) {
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return text.slice(0, len) + (text.length>len?'…':'');
      const start = Math.max(0, i - Math.floor(len/3));
      const end = Math.min(text.length, i + q.length + Math.floor(len*2/3));
      const before = text.slice(start, i);
      const match = text.slice(i, i + q.length);
      const after = text.slice(i + q.length, end);
      return (start>0?'…':'') + before + '<mark>' + match + '</mark>' + after + (end<text.length?'…':'');
    }
  
    function renderResults(items, q) {
      if (!q.trim()) { results.classList.remove('show'); results.innerHTML=''; return; }
      results.classList.add('show');
      if (!items.length) { results.innerHTML = `<div class="lcp-res-item">No matches for “${q}”.</div>`; return; }
      results.innerHTML = items.slice(0, 30).map((it, ix) => `
        <a class="lcp-res-item${ix===0?' active':''}" href="${it.url}">
          <div class="lcp-res-title">${it.title}</div>
          <div class="lcp-res-snippet">${highlightSnippet(it.text, q)}</div>
          <div class="lcp-res-url">${it.url}</div>
        </a>
      `).join('');
    }
  
    function searchIndex(index, q) {
      const query = q.trim().toLowerCase();
      if (!query) return [];
      const words = query.split(/\s+/).filter(Boolean);
      return index.map(doc => {
        const hay = (doc.title + ' ' + doc.text).toLowerCase();
        let score = 0;
        for (const w of words) {
          const inTitle = doc.title.toLowerCase().includes(w) ? 4 : 0;
          const count = hay.split(w).length - 1; // rough frequency
          score += inTitle + Math.min(count, 5);
        }
        return { ...doc, score };
      }).filter(d => d.score > 0)
        .sort((a,b)=> b.score - a.score);
    }
  
    let INDEX = null;
    let building = false;
  
    const doSearch = debounce(async () => {
      const q = input.value;
      if (!INDEX && !building) {
        building = true;
        const pages = await loadPageList();
        INDEX = await buildIndex(pages);
        building = false;
      }
      if (!INDEX) return; // still building
      renderResults(searchIndex(INDEX, q), q);
    }, 200);
  
    input.addEventListener('input', doSearch);
  
    // keyboard nav (up/down/enter)
    input.addEventListener('keydown', (e)=>{
      if (!results.classList.contains('show')) return;
      const items = [...results.querySelectorAll('.lcp-res-item')];
      if (!items.length) return;
      const i = items.findIndex(el => el.classList.contains('active'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nxt = items[(i+1) % items.length];
        items.forEach(el=>el.classList.remove('active')); nxt.classList.add('active'); nxt.scrollIntoView({ block:'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prv = items[(i-1+items.length) % items.length];
        items.forEach(el=>el.classList.remove('active')); prv.classList.add('active'); prv.scrollIntoView({ block:'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const go = items[i>=0?i:0]; if (go) location.href = go.getAttribute('href');
      }
    });
  
    // close results if clicking elsewhere
    document.addEventListener('click', (e)=>{
      if (!root.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove('show');
      }
    });
  
    // optional: rebuild index if you force-refresh with different version
    window.LCP_SEARCH_CLEAR_CACHE = () => localStorage.removeItem(storeKey);
  })();