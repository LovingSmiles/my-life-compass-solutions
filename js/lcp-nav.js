// My Life Compass Solutions — Floating Top Nav + Inline Search with Suggestions
// - Wraps links in the bar, Logout pinned right, mobile menu toggle
// - Mood inversion, active highlight, hide-on-scroll, dynamic top padding
// - Live suggestions panel (titles + snippets) as you type
// - Press Enter or click -> opens page and scrolls to first match, with highlight

(function(){
    const cfg = Object.assign({
      moodCSSVar: '--mood-color',
      links: [
        ["index.html","Home"],
        ["vision.html","Vision Board"],
        ["journal.html","Journal"],
        ["growth.html","Growth"],
        ["growth-areas.html","Growth Areas"],
        ["hobbies.html","Hobbies"],
        ["spiritual.html","Spiritual"],
        ["physical.html","Physical"],
        ["mental.html","Mental"],
        ["financial.html","Financial"],
        ["calendar.html","Calendar"],
        ["contact.html","Contact"],
        ["feedback.html","Feedback"],
        ["theme-settings.html","Theme of the Day"],
        ["#","Logout","logoutBtn"]
      ],
      onLogout: null,
      indexUrl: "/pages.json",   // JSON list of pages to index
      cacheVersion: "v3"
    }, window.LCP_NAV_CONFIG || {});
  
    /* ----------------- color helpers ----------------- */
    function hexToRgb(h){
      if(!h) return [37,99,235];
      h = h.replace('#','').trim();
      if(h.length===3) h = h.split('').map(c=>c+c).join('');
      const n = parseInt(h,16);
      return [(n>>16)&255, (n>>8)&255, n&255];
    }
    function rgbToHex([r,g,b]){
      return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
    }
    function cssColorToHex(val){
      if(String(val||'').trim().startsWith('#')) return val;
      const t = document.createElement('span');
      t.style.color = val || '#2563eb';
      document.body.appendChild(t);
      const rgb = getComputedStyle(t).color;
      document.body.removeChild(t);
      const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
      return m ? rgbToHex([+m[1], +m[2], +m[3]]) : '#2563eb';
    }
    function invertHex(hex){
      const [r,g,b] = hexToRgb(hex);
      return rgbToHex([255-r, 255-g, 255-b]);
    }
    function setVar(name, val){ document.documentElement.style.setProperty(name, val); }
    function getVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  
    /* ----------------- build nav ----------------- */
    function buildNav(){
      const nav = document.createElement('nav');
      nav.className = 'lcp-floating-nav';
      nav.setAttribute('role','navigation');
      nav.setAttribute('aria-label','Primary');
  
      const menuBtn = document.createElement('button');
      menuBtn.className = 'lcp-menu';
      menuBtn.type = 'button';
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
      menuBtn.textContent = '☰';
  
      const linksWrap = document.createElement('div');
      linksWrap.className = 'lcp-links';
  
      const right = document.createElement('div');
      right.className = 'lcp-right';
  
      const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  
      cfg.links.forEach(([href,label,id])=>{
        const a = document.createElement('a');
        a.href = href;
        a.target = '_top';
        a.dataset.path = href;
        a.textContent = label;
        if(id) a.id = id;
        if ((href || '').toLowerCase() === here) a.classList.add('active');
        if (id === 'logoutBtn') {
          a.classList.add('lcp-logout');
          right.appendChild(a);   // logout goes last on right
        } else {
          linksWrap.appendChild(a);
        }
      });
  
      // Inline search (insert before logout)
      const search = document.createElement('div');
      search.className = 'lcp-s';
      search.innerHTML = `
        <button class="lcp-s-fab" title="Search" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
            <path d="M20 20L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </button>
        <div class="lcp-s-wrap"><input class="lcp-s-input" type="search" placeholder="Search site…" aria-label="Search site"></div>
      `;
      right.prepend(search);
  
      nav.appendChild(menuBtn);
      nav.appendChild(linksWrap);
      nav.appendChild(right);
      document.body.appendChild(nav);
  
      // Mobile toggle
      menuBtn.addEventListener('click', ()=>{
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
      });
  
      // Logout hook
      const logout = document.getElementById('logoutBtn');
      if (logout && typeof cfg.onLogout === 'function'){
        logout.addEventListener('click', (e)=>{ e.preventDefault(); cfg.onLogout(); });
      }
  
      // Search init
      initSearch(search);
    }
  
    /* ----------------- mood inversion + layout ----------------- */
    function applyOpposite(){
      let mood = getVar(cfg.moodCSSVar) || '#2563eb';
      mood = cssColorToHex(mood);
      const opposite = invertHex(mood);
      setVar('--nav-bg', opposite);
  
      const [r,g,b] = hexToRgb(opposite);
      const yiq = (r*299 + g*587 + b*114)/1000;
      setVar('--nav-ink', yiq >= 160 ? '#0b1020' : '#e8eefc');
    }
  
    function updateOffset(){
      const nav = document.querySelector('.lcp-floating-nav');
      if(!nav) return;
      const hidden = nav.classList.contains('hide');
      if (hidden){
        setVar('--nav-offset', '16px');
      }else{
        const rect = nav.getBoundingClientRect();
        setVar('--nav-offset', Math.round(rect.height + 14) + 'px');
      }
    }
    const ro = new ResizeObserver(()=> updateOffset());
  
    function initHideOnScroll(){
      let lastY = window.scrollY, ticking = false;
      function onScroll(){
        const nav = document.querySelector('.lcp-floating-nav'); if(!nav) return;
        const y = window.scrollY, d = y - lastY;
        if (Math.abs(d) > 4){
          if (d > 0 && y > 80){ if (!nav.classList.contains('hide')){ nav.classList.add('hide'); updateOffset(); } }
          else { if (nav.classList.contains('hide')){ nav.classList.remove('hide'); updateOffset(); } }
          lastY = y;
        }
      }
      window.addEventListener('scroll', ()=>{
        if (!ticking){ requestAnimationFrame(()=>{ onScroll(); ticking = false; }); ticking = true; }
      });
    }
  
    function observeMoodVar(){
      const obs = new MutationObserver(()=>{ applyOpposite(); updateOffset(); });
      obs.observe(document.documentElement, { attributes:true, attributeFilter:['style','class'] });
      window.addEventListener('orientationchange', ()=>{ applyOpposite(); updateOffset(); });
    }
  
    /* ----------------- inline search with suggestions ----------------- */
    function initSearch(container){
      const fab = container.querySelector('.lcp-s-fab');
      const wrap = container.querySelector('.lcp-s-wrap');
      const input = container.querySelector('.lcp-s-input');
  
      const results = document.createElement('div');
      results.className = 'lcp-s-results';
      document.body.appendChild(results);
  
      const open = ()=>{ wrap.classList.add('open'); input.focus(); render([], [], ''); };
      const close= ()=>{ wrap.classList.remove('open'); results.classList.remove('show'); results.innerHTML=''; input.value=''; };
  
      fab.addEventListener('click', ()=> wrap.classList.contains('open') ? close() : open());
      document.addEventListener('keydown', (e)=>{
        if (e.key==='/' && !e.metaKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); open(); }
        if (e.key==='Escape'){ close(); }
      });
      document.addEventListener('click', (e)=>{
        const nav = document.querySelector('.lcp-floating-nav');
        if (!nav.contains(e.target) && !results.contains(e.target)) close();
      });
  
      // Build index once
      const storeKey = `lcpSearchCache:${cfg.cacheVersion||'v1'}`;
      let INDEX = null, TOKEN_SET = null, building = false;
  
      const debounce = (fn, ms=200) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };
  
      async function loadPageList(){
        // Prefer /pages.json; fallback to nav data-paths
        if (cfg.indexUrl){
          try{ const r = await fetch(cfg.indexUrl, { credentials:'same-origin' }); if (r.ok) return await r.json(); }catch{}
        }
        const links = [...document.querySelectorAll('.lcp-links a[data-path]')];
        const seen = new Set(), list = [];
        links.forEach(a=>{
          const url = new URL(a.getAttribute('data-path'), location.href).pathname;
          if (!seen.has(url)){ seen.add(url); list.push({ url, title: a.textContent.trim() || url }); }
        });
        if (!seen.has(location.pathname)) list.push({ url: location.pathname, title: document.title || location.pathname });
        return list;
      }
  
      function strip(html){
        const tmp = document.createElement('div'); tmp.innerHTML = html;
        tmp.querySelectorAll('script,style,noscript,nav,footer,aside').forEach(el=>el.remove());
        return (tmp.textContent||'').replace(/\s+/g,' ').trim();
      }
  
      async function fetchText(url){
        const r = await fetch(url, { credentials:'same-origin' });
        if (!r.ok) throw 0;
        return strip(await r.text());
      }
  
      function tokenize(text){
        return (text.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
      }
  
      async function buildIndex(){
        const cached = localStorage.getItem(storeKey);
        if (cached){
          try{
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)){
              const { index, tokens } = rebuildTokens(parsed);
              TOKEN_SET = tokens;
              return index;
            }
          }catch{}
        }
  
        const pages = await loadPageList();
        const index = [];
        for (const p of pages){
          try{
            const txt = await fetchText(p.url);
            index.push({ url: p.url, title: p.title || p.url, text: txt });
          }catch{}
        }
        localStorage.setItem(storeKey, JSON.stringify(index));
  
        const { tokens } = rebuildTokens(index);
        TOKEN_SET = tokens;
        return index;
      }
  
      function rebuildTokens(index){
        const tokens = new Map(); // token -> frequency
        index.forEach(doc=>{
          const words = tokenize(doc.title + ' ' + doc.text);
          words.forEach(w => tokens.set(w, (tokens.get(w)||0) + 1));
        });
        return { index, tokens };
      }
  
      function scoreSearch(index, q){
        const query = q.trim().toLowerCase();
        if (!query) return [];
        const words = query.split(/\s+/).filter(Boolean);
        return index.map(doc=>{
          const hay = (doc.title+' '+doc.text).toLowerCase();
          let score = 0;
          for (const w of words){
            const inTitle = doc.title.toLowerCase().includes(w) ? 4 : 0;
            const count = hay.split(w).length - 1;
            score += inTitle + Math.min(count, 6);
          }
          return {...doc, score};
        }).filter(d=>d.score>0).sort((a,b)=> b.score - a.score);
      }
  
      function suggestTokens(prefix, limit=6){
        if (!TOKEN_SET || !prefix) return [];
        const p = prefix.toLowerCase();
        const out = [];
        for (const [tok, freq] of TOKEN_SET){
          if (tok.startsWith(p)) out.push([tok, freq]);
        }
        out.sort((a,b)=> b[1]-a[1]);
        return out.slice(0, limit).map(([tok])=> tok);
      }
  
      function highlightSnippet(text, q, len=140){
        const i = text.toLowerCase().indexOf(q.toLowerCase());
        if (i<0) return text.slice(0,len)+(text.length>len?'…':'');
        const s = Math.max(0, i - Math.floor(len/3));
        const e = Math.min(text.length, i + q.length + Math.floor(len*2/3));
        const before=text.slice(s,i), match=text.slice(i,i+q.length), after=text.slice(i+q.length,e);
        return (s>0?'…':'')+before+'<mark>'+match+'</mark>'+after+(e<text.length?'…':'');
      }
  
      function render(resultsDocs, wordSuggestions, q){
        if (!q.trim() && !wordSuggestions.length && !resultsDocs.length){
          results.classList.remove('show'); results.innerHTML=''; return;
        }
        results.classList.add('show');
  
        const suggHtml = wordSuggestions.length
          ? `<div class="lcp-s-group"><div class="lcp-s-head">Suggestions</div>${
              wordSuggestions.map(w=>`<a class="lcp-s-item" data-suggest="${w}" href="#">${w}</a>`).join('')
            }</div>`
          : '';
  
        const docsHtml = resultsDocs.length
          ? `<div class="lcp-s-group"><div class="lcp-s-head">Results</div>${
              resultsDocs.slice(0,40).map(d=>`
                <a class="lcp-s-item" href="${d.url}?q=${encodeURIComponent(q)}">
                  <div class="lcp-s-title">${d.title}</div>
                  <div class="lcp-s-snippet">${highlightSnippet(d.text, q)}</div>
                  <div class="lcp-s-url">${d.url}</div>
                </a>`).join('')
            }</div>`
          : `<div class="lcp-s-group"><div class="lcp-s-head">Results</div><div class="lcp-s-item">No matches for “${q}”.</div></div>`;
  
        results.innerHTML = suggHtml + docsHtml;
  
        // clicking a suggestion fills input and re-searches
        results.querySelectorAll('[data-suggest]').forEach(a=>{
          a.addEventListener('click', (e)=>{
            e.preventDefault();
            input.value = a.getAttribute('data-suggest');
            doSearch();
          });
        });
      }
  
      const doSearch = debounce(async ()=>{
        const q = input.value;
        if (!INDEX && !building){ building = true; INDEX = await buildIndex(); building = false; }
        if (!INDEX) return;
  
        const docs = scoreSearch(INDEX, q);
        const lastWord = (q.trim().split(/\s+/).pop() || '');
        const sugg = lastWord.length >= 2 ? suggestTokens(lastWord) : [];
        render(docs, sugg, q);
      }, 160);
  
      input.addEventListener('input', doSearch);
  
      // Enter -> go to top result (with ?q= param for deep scroll)
      input.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter'){
          const first = results.querySelector('.lcp-s-group:nth-of-type(2) .lcp-s-item[href]') || results.querySelector('.lcp-s-item[href]');
          if (first){
            e.preventDefault();
            location.href = first.getAttribute('href');
          }
        }
      });
    }
  
    /* ----------------- cross-page highlight & scroll ----------------- */
    function scrollToQuery(){
      const q = new URLSearchParams(location.search).get('q');
      if (!q) return;
  
      // Walk text nodes and wrap first match with <mark>
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node){
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
          if (node.parentElement && ['SCRIPT','STYLE','NOSCRIPT','NAV','FOOTER','ASIDE'].includes(node.parentElement.tagName)) return NodeFilter.FILTER_SKIP;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
  
      const lower = q.toLowerCase();
      let foundNode = null, offset = 0;
      while(walker.nextNode()){
        const text = walker.currentNode.nodeValue;
        const i = text.toLowerCase().indexOf(lower);
        if (i >= 0){ foundNode = walker.currentNode; offset = i; break; }
      }
  
      if (foundNode){
        const range = document.createRange();
        range.setStart(foundNode, offset);
        range.setEnd(foundNode, Math.min(foundNode.length, offset + q.length));
  
        const mark = document.createElement('mark');
        mark.style.background = 'transparent';
        mark.style.outline = '2px solid ' + (getComputedStyle(document.documentElement).getPropertyValue('--nav-blue').trim() || '#3b82f6');
        mark.style.padding = '2px 2px';
        mark.appendChild(range.extractContents());
        range.insertNode(mark);
  
        mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
        // brief pulse
        mark.animate([{outlineOffset:'0px'},{outlineOffset:'4px'}], {duration:600, direction:'alternate', iterations:2});
      }
    }
  
    /* ----------------- init ----------------- */
    document.addEventListener('DOMContentLoaded', ()=>{
      buildNav();
      applyOpposite();
  
      const nav = document.querySelector('.lcp-floating-nav');
      if (nav){
        ro.observe(nav);
        requestAnimationFrame(updateOffset);
        window.addEventListener('resize', updateOffset);
      }
  
      observeMoodVar();
      initHideOnScroll();
      scrollToQuery(); // run on every page so deep links jump to the match
    });
  })();