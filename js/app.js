/* Life Compass Pro — Ultimate Journal App (client-side)
   No external libraries; PWA-friendly; optional encryption via WebCrypto.
   Everything stores locally in the browser (localStorage).
*/

/* =========================
   CONSTANTS & GLOBAL STATE
   ========================= */
   const entriesKey = 'lcp_journal_entries_v1';
   const vaultKey   = 'lcp_journal_vault_enc_v1';       // encrypted blob if locked
   const banksKey   = 'lcp_banks_v1';                    // custom emotions/themes
   const brandKey   = 'lcp_brand_v1';                    // branding
   const goalsKey   = 'lcp_goals_v1';                    // goals
   const reviewKey  = 'lcp_last_review_date';            // biweekly review
   const draftKey   = 'lcp_journal_draft_v1';            // text draft
   let entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');
   let goals   = JSON.parse(localStorage.getItem(goalsKey)   || '[]');
   
   let filterFrom = null, filterTo = null;
   let pendingPhotos = [];
   let privateOn = false;
   let locked = false;
   
   const EMOTIONS_DEFAULT = ["Calm","Grateful","Hopeful","Motivated","Proud","Joyful","Tender",
                             "Anxious","Sad","Angry","Overwhelmed","Tired","Lonely","Frustrated","Confused"];
   
   const THEMES_DEFAULT = ["Faith","Family","Work","Health","Anxiety","Motivation","Grief","Love","Progress"];
   
   const PROMPTS = [
     "What did I handle today that past-me would’ve avoided?",
     "Which value guided one decision today?",
     "Where did my body say 'yes' or 'no'?",
     "What tiny win deserves more credit?",
     "If I was kinder to myself, I’d say…",
     "What am I learning to let go of?",
     "What’s one boundary I kept (or want to keep)?",
     "What helped me feel safe today?"
   ];
   
   // i18n minimal
   const I18N = {
     en: { story_note: "Keep going — you’re farther along than you think." },
     es: { story_note: "Sigue adelante: estás más lejos de lo que crees." },
     fr: { story_note: "Continue — tu es plus loin que tu ne le penses." }
   };
   let LANG = (localStorage.getItem('lcp_lang') || 'en');
   
   
   /* =========================
      TINY HELPERS
      ========================= */
   const $  = (s, r=document)=> r.querySelector(s);
   const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
   const save = (k,v)=> localStorage.setItem(k, JSON.stringify(v));
   const read = (k,fb)=> { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
   const uid  = ()=> crypto?.randomUUID?.() || ('e_'+Date.now()+'_'+Math.random().toString(36).slice(2));
   const todayYMD = ()=> new Date().toISOString().slice(0,10);
   
   function downloadFile(name, content, type){
     const blob = new Blob([content], {type});
     const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
   }
   function formatDate(d){ const dt = typeof d==='string'? new Date(d) : d; return dt.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}); }
   function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
   function endOfDay(d){ const x = new Date(d); x.setHours(23,59,59,999); return x; }
   function nl2br(s){ return (s||'').replace(/\n/g,'<br>'); }
   function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
   function flash(sel){
     const el = document.querySelector(sel); if(!el) return;
     el.style.display='inline-block'; el.style.opacity='1';
     setTimeout(()=>{ el.style.transition='opacity .8s'; el.style.opacity='0'; setTimeout(()=>{ el.style.display='none'; el.style.transition=''; el.style.opacity=''; },900); }, 1000);
   }
   function topByCount(arr){
     if(!arr || !arr.length) return null;
     const m = {}; arr.forEach(x=>{ if(x) m[x]=(m[x]||0)+1; });
     const sorted = Object.entries(m).sort((a,b)=> b[1]-a[1]);
     if(!sorted.length) return null;
     const topCount = sorted[0][1];
     const ties = sorted.filter(([k,c])=>c===topCount).map(([k])=>k);
     return ties.join(', ');
   }
   function wordCounts(text){
     const stop = new Set(('i me my myself we our ours ourselves you your yours yourself yourselves he him his himself she her hers herself it its itself '+
       'they them their theirs themselves what which who whom this that these those am is are was were be been being have has had having do does did doing a an the '+
       'and but if or because as until while of at by for with about against between into through during before after above below to from up down in out on off over '+
       'under again further then once here there when where why how all any both each few more most other some such no nor not only own same so than too very can will just don t should now').split(/\s+/));
     const words = (text||'').toLowerCase().match(/[a-z’']{3,}/g) || [];
     const m = {}; words.forEach(w=>{ if(!stop.has(w)) m[w]=(m[w]||0)+1; });
     return m;
   }
   function countMatches(text, arr){ let n=0; arr.forEach(w=>{ const re=new RegExp('\\b'+w+'\\b','g'); n += ((text||'').match(re)||[]).length; }); return n; }
   function calcStreaks(list){
     if(!list.length) return {cur:0,best:0};
     const days = [...new Set(list.map(e=>e.date))].sort();
     let best=1, cur=1;
     for(let i=1;i<days.length;i++){
       const prev = new Date(days[i-1]), now = new Date(days[i]);
       const diff = (now - prev)/(1000*60*60*24);
       if(Math.round(diff)===1){ cur++; best=Math.max(best,cur); }
       else cur=1;
     }
     return {cur, best};
   }
   function computeBadges(ascList){
     const out = new Set();
     const n = ascList.length;
     if(n>=1){ out.add('First Step'); }
     if(n>=7){ out.add('Weekly Writer'); }
     if(n>=30){ out.add('Month of Showing Up'); }
     const stars = ascList.filter(e=>e.star).length;
     if(stars>=10) out.add('Highlights Collector');
     const moodAvg = n ? (ascList.reduce((s,e)=>s+(+e.mood||0),0)/n) : 0;
     if(moodAvg>=4) out.add('High Spirits');
     const st=calcStreaks(ascList);
     if(st.best>=7) out.add('7-Day Streak');
     if(st.best>=30) out.add('30-Day Streak');
     const uniqueThemes = new Set(ascList.map(e=>e.theme).filter(Boolean)).size;
     if(uniqueThemes>=5) out.add('Explorer');
     return Array.from(out);
   }
   
   /* =========================
      BRANDING & BANKS (EMOTIONS/THEMES)
      ========================= */
   function loadBanks(){
     const def = { emotions: EMOTIONS_DEFAULT.slice(), themes: THEMES_DEFAULT.slice() };
     try { return JSON.parse(localStorage.getItem(banksKey)) || def; } catch { return def; }
   }
   function saveBanks(b){ localStorage.setItem(banksKey, JSON.stringify(b)); }
   function refreshEmotionChips(){
     const b = loadBanks();
     const wrap = document.getElementById('emotionChips'); if(!wrap) return;
     wrap.innerHTML='';
     b.emotions.forEach(e => {
       const label = document.createElement('label');
       label.className = 'jc-chip';
       label.innerHTML = `<input type="checkbox" value="${e}"><span>${e}</span>`;
       label.addEventListener('click', (ev)=>{
         if(ev.target.tagName !== 'INPUT'){
           const inp = label.querySelector('input');
           inp.checked = !inp.checked;
         }
         label.classList.toggle('is-on', label.querySelector('input').checked);
       });
       wrap.appendChild(label);
     });
   }
   function refreshThemeSelects(){
     const b = loadBanks();
     const themeSel = document.getElementById('entryTheme'); if(!themeSel) return;
     const keep = themeSel.value;
     themeSel.innerHTML = `<option value="">Theme (optional)</option>` + b.themes.map(t=> `<option>${t}</option>`).join('');
     if(b.themes.includes(keep)) themeSel.value = keep;
   
     const sel = document.getElementById('filterTheme');
     if(sel){
       const keep2 = sel.value;
       sel.innerHTML = '<option value="">Theme (any)</option>' + b.themes.map(t=>`<option>${t}</option>`).join('');
       if(b.themes.includes(keep2)) sel.value = keep2;
     }
   }
   function loadBrand(){
     const def = { name: 'Life Compass Pro', accent: '#3a7f6f' };
     try { return JSON.parse(localStorage.getItem(brandKey)) || def; } catch { return def; }
   }
   function applyBrand(){
     const b = loadBrand();
     document.title = b.name + ' — Journal';
     document.documentElement.style.setProperty('--jc-accent', b.accent);
     const headerTitle = document.getElementById('brandTitle');
     if(headerTitle) headerTitle.textContent = b.name;
     const nameEl = document.getElementById('brandName');
     const accEl  = document.getElementById('brandAccent');
     if(nameEl) nameEl.value = b.name;
     if(accEl)  accEl.value  = b.accent;
   }
   
   /* =========================
      JOURNAL: ELEMENT HOOKS
      ========================= */
   const entryDate   = document.getElementById('entryDate');
   const mood        = document.getElementById('mood');
   const energy      = document.getElementById('energy');
   const moodLabel   = document.getElementById('moodLabel');
   const energyLabel = document.getElementById('energyLabel');
   
   /* =========================
      INIT BASIC UI
      ========================= */
   (function initBasics(){
     if(entryDate) entryDate.valueAsDate = new Date();
   
     // Emotions chips & filters
     refreshEmotionChips();
     const b = loadBanks();
     // Fill emotion filter options
     (function(){
       const emSel = document.getElementById('filterEmotion');
       if(!emSel) return;
       emSel.innerHTML = `<option value="">Emotion (any)</option>` + b.emotions.map(e=>`<option>${e}</option>`).join('');
     })();
     refreshThemeSelects();
   
     // Language
     const langSel = document.getElementById('languageSelect');
     if(langSel){
       langSel.value = LANG;
       langSel.addEventListener('change', (e)=>{
         LANG = e.target.value; localStorage.setItem('lcp_lang', LANG); render();
       });
     }
   
     // Mood/energy labels
     function paintLabels(){
       if(!mood || !energy) return;
       moodLabel.textContent = ['Very Low','Low','Neutral','Good','Great'][+mood.value-1];
       energyLabel.textContent = (+energy.value<=1?'Very Low':+energy.value==2?'Low':+energy.value==3?'Medium':+energy.value==4?'High':'Very High');
     }
     if(mood){ mood.addEventListener('input', paintLabels); }
     if(energy){ energy.addEventListener('input', paintLabels); }
     if(mood && energy) paintLabels();
   
     // Dark Mode
     const darkBtn = document.getElementById('darkBtn');
     const savedTheme = localStorage.getItem('lcp_theme');
     if(savedTheme==='dark') document.body.classList.add('dark');
     if(darkBtn){
       darkBtn.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
       darkBtn.setAttribute('aria-pressed', document.body.classList.contains('dark') ? 'true':'false');
       darkBtn.addEventListener('click', ()=>{
         document.body.classList.toggle('dark');
         const isDark = document.body.classList.contains('dark');
         localStorage.setItem('lcp_theme', isDark?'dark':'light');
         darkBtn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
         darkBtn.setAttribute('aria-pressed', isDark ? 'true':'false');
       });
     }
   
     // Privacy blur & Panic
     $('#privacyBtn')?.addEventListener('click', ()=>{
       privateOn = !privateOn;
       document.body.classList.toggle('private-blur', privateOn);
       $('#privacyBtn').textContent = privateOn ? '🔓 Unblur' : '🔒 Blur';
     });
     $('#panicBtn')?.addEventListener('click', ()=>{
       $('#entriesList')?.replaceChildren();
       const card = document.createElement('div');
       card.className = 'jc-card';
       card.innerHTML = '<em class="jc-muted">Nothing to see here ✨</em>';
       $('#entriesList')?.appendChild(card);
       const st = $('#storyOut'); if(st) st.innerHTML='';
     });
   
     // Print shortcut
     document.addEventListener('keydown', (e)=>{
       if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='p'){ e.preventDefault(); window.print(); }
     });
   
     // Search input ESC to clear
     const searchInput = document.getElementById('searchBox');
     if(searchInput){
       searchInput.addEventListener('keydown', (e)=>{
         if(e.key==='Escape'){ searchInput.value=''; render(); }
       });
     }
   
     applyBrand();
   })();
   
   /* =========================
      PHOTOS
      ========================= */
   document.getElementById('photosInput')?.addEventListener('change', async (e)=>{
     pendingPhotos = [];
     const files = [...e.target.files].slice(0,6);
     const preview = document.getElementById('photosPreview'); if(preview) preview.innerHTML='';
     for(const f of files){
       const b64 = await fileToDataURL(f);
       pendingPhotos.push(b64);
       const img = new Image(); img.src = b64; img.style.maxWidth='80px'; img.style.borderRadius='8px';
       img.alt = "Attached photo preview";
       preview?.appendChild(img);
     }
   });
   function fileToDataURL(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
   
   /* =========================
      AUTOSAVE DRAFT
      ========================= */
   const entryTextEl = document.getElementById('entryText');
   if(entryTextEl){
     entryTextEl.value = localStorage.getItem(draftKey) || '';
     entryTextEl.addEventListener('input', ()=> localStorage.setItem(draftKey, entryTextEl.value));
   }
   
   /* =========================
      DICTATION
      ========================= */
   let rec=null, dictating=false;
   document.getElementById('dictateBtn')?.addEventListener('click', ()=>{
     if(!('webkitSpeechRecognition' in window)){ alert('Speech recognition not supported in this browser.'); return; }
     if(!rec){
       rec = new webkitSpeechRecognition();
       rec.continuous = true; rec.interimResults = true; rec.lang = 'en-US';
       rec.onresult = (e)=>{
         let final=''; for(let i=e.resultIndex;i<e.results.length;i++){
           const r = e.results[i]; if(r.isFinal) final += r[0].transcript + ' ';
         }
         if(final) entryTextEl.value += (final.trim()+' ');
         localStorage.setItem(draftKey, entryTextEl.value);
       };
       rec.onend = ()=>{ dictating=false; document.getElementById('dictateBtn').textContent='🎤 Dictate'; };
     }
     if(!dictating){ rec.start(); dictating=true; document.getElementById('dictateBtn').textContent='⏹ Stop'; }
     else { rec.stop(); }
   });
   
   /* =========================
      PROMPT BUTTON
      ========================= */
   document.getElementById('promptBtn')?.addEventListener('click', ()=>{
     const p = PROMPTS[Math.floor(Math.random()*PROMPTS.length)];
     const out = document.getElementById('promptOut');
     if(out) out.textContent = p;
     if(entryTextEl && !entryTextEl.value) entryTextEl.value = p + ' — ';
   });
   
   /* =========================
      SAVE / EDIT / DELETE / STAR
      ========================= */
   function buildItemFromForm(){
     const getVal = id => document.getElementById(id)?.value ?? '';
     const selectedEmos = [...document.querySelectorAll('#emotionChips input:checked')].map(i=>i.value);
     const now = new Date();
     return {
       id: 'e_'+now.getTime(),
       date: getVal('entryDate') || new Date().toISOString().slice(0,10),
       mood: +getVal('mood') || 3,
       energy: +getVal('energy') || 3,
       sleep: +getVal('sleep') || null,
       stress: +getVal('stress') || null,
       gratitude: [getVal('grat1'), getVal('grat2'), getVal('grat3')].filter(Boolean),
       emotions: selectedEmos,
       theme: getVal('entryTheme') || null,
       text: (getVal('entryText')||'').trim(),
       tags: (getVal('tags')||"").split(',').map(s=>s.trim()).filter(Boolean),
       photos: pendingPhotos.slice(),
       star: false,
       cbt: { thought:getVal('cbtThought'), emotion:getVal('cbtEmotion'), behavior:getVal('cbtBehavior'), reframe:getVal('cbtReframe') },
       act: { in:getVal('actIn'), out:getVal('actOut') },
       mind: { bodyScan:getVal('bodyScan'), grounding:getVal('grounding') },
       pos: { good:[getVal('good1'),getVal('good2'),getVal('good3')].filter(Boolean), proud:getVal('proudOf') }
     };
   }
   function clearEntryFields(){
     ['cbtThought','cbtEmotion','cbtBehavior','cbtReframe','actIn','actOut','bodyScan','grounding','good1','good2','good3','proudOf','entryText','grat1','grat2','grat3','tags'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
     localStorage.removeItem(draftKey);
     document.querySelectorAll('#emotionChips input').forEach(i=>{ i.checked=false; i.closest('.jc-chip')?.classList.remove('is-on'); });
     const sel = document.getElementById('entryTheme'); if(sel) sel.value='';
     const defaults = {sleep:7, stress:2, mood:3, energy:3};
     Object.entries(defaults).forEach(([k,v])=>{ const el=document.getElementById(k); if(el) el.value=v; });
     pendingPhotos = []; const pv = document.getElementById('photosPreview'); if(pv){ pv.innerHTML=''; const pi=document.getElementById('photosInput'); if(pi) pi.value=''; }
     const ed = document.getElementById('entryDate'); if(ed){ ed.valueAsDate = new Date(); delete ed.dataset.editingId; }
   }
   document.getElementById('saveEntry')?.addEventListener('click', ()=>{
     if(locked){ alert('Vault is locked. Unlock before saving.'); return; }
     const ed = document.getElementById('entryDate');
     const editingId = ed?.dataset.editingId;
     const item = buildItemFromForm();
     if(editingId){
       item.id = editingId;
       const i = entries.findIndex(x=>x.id===editingId); if(i>=0) entries[i] = item;
     } else {
       entries.push(item);
     }
     save(entriesKey, entries);
     clearEntryFields();
     applyFilterFromPreset();
     flash('#storyBadge');
     refreshThemeSelects();
     updateHomeSnapshot();
   });
   document.getElementById('clearEntry')?.addEventListener('click', clearEntryFields);
   
   function editEntry(id){
     if(locked){ alert('Vault is locked. Unlock first.'); return; }
     const i = entries.findIndex(x=>x.id===id); if(i<0) return;
     const e = entries[i];
     const ed = document.getElementById('entryDate'); if(ed){ ed.value = e.date; ed.dataset.editingId = id; }
     const mood = document.getElementById('mood'); const energy = document.getElementById('energy');
     if(mood){ mood.value = e.mood||3; }
     if(energy){ energy.value = e.energy||3; }
     document.getElementById('sleep').value = e.sleep??7;
     document.getElementById('stress').value = e.stress??2;
     ['grat1','grat2','grat3'].forEach((k,ix)=> document.getElementById(k).value = e.gratitude?.[ix]||'');
     document.querySelectorAll('#emotionChips input').forEach(inp=>{
       const on = (e.emotions||[]).includes(inp.value); inp.checked = on; inp.closest('.jc-chip')?.classList.toggle('is-on', on);
     });
     document.getElementById('entryTheme').value = e.theme||'';
     document.getElementById('entryText').value = e.text||'';
     localStorage.setItem(draftKey, e.text||'');
     document.getElementById('tags').value = (e.tags||[]).join(', ');
     pendingPhotos = e.photos||[];
     const preview = document.getElementById('photosPreview'); preview.innerHTML='';
     pendingPhotos.slice(0,6).forEach(p=>{ const img=new Image(); img.src=p; img.style.maxWidth='80px'; img.style.borderRadius='8px'; img.alt="Existing photo"; preview.appendChild(img); });
     document.getElementById('cbtThought').value = e.cbt?.thought||'';
     document.getElementById('cbtEmotion').value = e.cbt?.emotion||'';
     document.getElementById('cbtBehavior').value = e.cbt?.behavior||'';
     document.getElementById('cbtReframe').value = e.cbt?.reframe||'';
     document.getElementById('actIn').value = e.act?.in||'';
     document.getElementById('actOut').value = e.act?.out||'';
     document.getElementById('bodyScan').value = e.mind?.bodyScan||'';
     document.getElementById('grounding').value = e.mind?.grounding||'';
     document.getElementById('good1').value = e.pos?.good?.[0]||'';
     document.getElementById('good2').value = e.pos?.good?.[1]||'';
     document.getElementById('good3').value = e.pos?.good?.[2]||'';
     document.getElementById('proudOf').value = e.pos?.proud||'';
     window.scrollTo({ top:0, behavior:'smooth' });
   }
   function deleteEntry(id){
     if(locked){ alert('Vault is locked. Unlock first.'); return; }
     if(!confirm('Delete this entry?')) return;
     entries = entries.filter(e=>e.id!==id);
     save(entriesKey, entries);
     render();
     refreshThemeSelects();
     updateHomeSnapshot();
   }
   function toggleStar(id){
     if(locked){ alert('Vault is locked. Unlock first.'); return; }
     const i = entries.findIndex(x=>x.id===id); if(i<0) return;
     entries[i].star = !entries[i].star;
     save(entriesKey, entries);
     render();
     updateHomeSnapshot();
   }
   
   /* =========================
      EXPORT / IMPORT
      ========================= */
   document.getElementById('exportBtn')?.addEventListener('click', ()=>{
     downloadFile(`journal_export_${todayYMD()}.json`, JSON.stringify(entries,null,2), 'application/json');
   });
   document.getElementById('exportMdBtn')?.addEventListener('click', ()=>{
     const list = currentFiltered();
     let md = `# Journal Export\n\n`;
     list.forEach(e=>{
       md += `## ${e.date} ${e.theme?`· ${e.theme}`:''} ${e.star?'· ⭐':''}\n`;
       md += `- Mood: ${e.mood??'-'} | Energy: ${e.energy??'-'} | Sleep: ${e.sleep??'-'}h | Stress: ${e.stress??'-'}/5\n`;
       if(e.emotions?.length) md += `- Emotions: ${e.emotions.join(', ')}\n`;
       if(e.tags?.length) md += `- Tags: ${e.tags.join(', ')}\n`;
       if(e.gratitude?.length){ md += `- Gratitude:\n`; e.gratitude.forEach(g=> md+=`  - ${g}\n`); }
       if(e.pos?.good?.length){ md += `- Good Things:\n`; e.pos.good.forEach(g=> md+=`  - ${g}\n`); }
       if(e.pos?.proud) md += `- Proud Of: ${e.pos.proud}\n`;
       md += `\n${e.text||''}\n\n---\n\n`;
     });
     downloadFile(`journal_${todayYMD()}.md`, md, 'text/markdown');
   });
   document.getElementById('exportCsvBtn')?.addEventListener('click', ()=>{
     const list = currentFiltered();
     const cols = ['id','date','mood','energy','sleep','stress','emotions','theme','text','tags','gratitude','good','proud','star'];
     const lines = [cols.join(',')];
     list.forEach(e=>{
       const row = {
         id: e.id,
         date: e.date,
         mood: e.mood??'',
         energy: e.energy??'',
         sleep: e.sleep??'',
         stress: e.stress??'',
         emotions: (e.emotions||[]).join('|'),
         theme: e.theme||'',
         text: (e.text||'').replace(/\n/g,' ').replace(/"/g,'""'),
         tags: (e.tags||[]).join('|'),
         gratitude: (e.gratitude||[]).join('|'),
         good: (e.pos?.good||[]).join('|'),
         proud: (e.pos?.proud||'').replace(/"/g,'""'),
         star: e.star?1:0
       };
       lines.push(cols.map(k=> `"${(row[k]??'')}"`).join(','));
     });
     downloadFile(`journal_${todayYMD()}.csv`, lines.join('\n'), 'text/csv');
   });
   document.getElementById('importFile')?.addEventListener('change', (e)=>{
     const file = e.target.files[0]; if(!file) return;
     const reader = new FileReader();
     reader.onload = evt=>{
       try{
         const data = JSON.parse(evt.target.result);
         if(Array.isArray(data)){
           entries = data;
           save(entriesKey, entries);
           applyFilterFromPreset();
           refreshThemeSelects();
           updateHomeSnapshot();
         } else alert('Invalid JSON format.');
       }catch(err){ alert('Failed to import JSON.'); }
     };
     reader.readAsText(file);
   });
   document.getElementById('purgeBtn')?.addEventListener('click', ()=>{
     if(!confirm('This will delete ALL journal entries on this device. Continue?')) return;
     entries = []; save(entriesKey, entries); render(); refreshThemeSelects(); updateHomeSnapshot();
   });
   
   /* =========================
      FILTERS & RENDER
      ========================= */
   const rangePreset = document.getElementById('rangePreset');
   const yearsBox = document.getElementById('yearsBox');
   const customBox = document.getElementById('customBox');
   
   document.getElementById('applyYears')?.addEventListener('click', ()=>{
     const n = +document.getElementById('yearsBack').value || 1;
     const to = new Date(); const from = new Date(); from.setFullYear(from.getFullYear()-n);
     setFilter(from, to);
   });
   document.getElementById('applyCustom')?.addEventListener('click', ()=>{
     const f = document.getElementById('fromDate').value;
     const t = document.getElementById('toDate').value;
     if(!f || !t) return alert('Choose both dates.');
     setFilter(new Date(f), new Date(t + 'T23:59:59'));
   });
   rangePreset?.addEventListener('change', applyFilterFromPreset);
   document.getElementById('searchBox')?.addEventListener('input', render);
   document.getElementById('onlyStar')?.addEventListener('change', render);
   document.getElementById('filterEmotion')?.addEventListener('change', render);
   document.getElementById('filterTheme')?.addEventListener('change', render);
   
   function applyFilterFromPreset(){
     if(!rangePreset) return;
     if(yearsBox) yearsBox.style.display = 'none';
     if(customBox) customBox.style.display = 'none';
     const v = rangePreset.value;
     if(v==='years'){ if(yearsBox) yearsBox.style.display = 'inline-flex'; return; }
     if(v==='custom'){ if(customBox) customBox.style.display = 'inline-flex'; return; }
     if(v==='all'){ setFilter(null,null); return; }
     const days = +v;
     const to = new Date(); const from = new Date(); from.setDate(from.getDate()-days+1);
     setFilter(from, to);
   }
   function setFilter(from, to){ filterFrom = from; filterTo = to; render(); }
   
   function currentFiltered(){
     return entries.filter(e=>{
       const d = new Date(e.date);
       if(filterFrom && d < startOfDay(filterFrom)) return false;
       if(filterTo && d > endOfDay(filterTo)) return false;
       return true;
     }).sort((a,b)=> new Date(a.date) - new Date(b.date));
   }
   
   function renderMonthBar(){
     const bar = document.getElementById('monthStreak'); if(!bar) return;
     bar.innerHTML='';
     const map = {}; const now = new Date();
     for(let i=11;i>=0;i--){
       const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
       const key = d.getFullYear() + '-' + (d.getMonth()+1);
       map[key] = 0;
     }
     entries.forEach(e=>{
       const d = new Date(e.date); const key = d.getFullYear()+'-'+(d.getMonth()+1);
       if(key in map) map[key] += 1;
     });
     const max = Math.max(1, ...Object.values(map));
     Object.entries(map).forEach(([k,v])=>{
       const col = document.createElement('div');
       const h = Math.round((v/max)*60);
       col.style.height = Math.max(4,h)+'px';
       col.title = `${k} — ${v} entries`;
       bar.appendChild(col);
     });
   }
   
   function render(){
     // Summaries + filters + list
     const q = (document.getElementById('searchBox')?.value||'').toLowerCase();
     const wantStar = document.getElementById('onlyStar')?.checked;
     const emoFilter = document.getElementById('filterEmotion')?.value || '';
     const themeFilter = document.getElementById('filterTheme')?.value || '';
   
     const filtered = entries.slice().filter(e=>{
       const d = new Date(e.date);
       if(filterFrom && d < startOfDay(filterFrom)) return false;
       if(filterTo && d > endOfDay(filterTo)) return false;
       if(wantStar && !e.star) return false;
       if(emoFilter && !(e.emotions||[]).includes(emoFilter)) return false;
       if(themeFilter && e.theme!==themeFilter) return false;
       if(q){
         const hay = [ e.text||'', (e.tags||[]).join(' '), (e.emotions||[]).join(' '), (e.gratitude||[]).join(' '), e.theme||'' ].join(' ').toLowerCase();
         if(!hay.includes(q)) return false;
       }
       return true;
     }).sort((a,b)=> new Date(b.date) - new Date(a.date));
   
     $('#sumEntries') && ($('#sumEntries').textContent = filtered.length);
     const avgMood = filtered.length? (filtered.reduce((s,e)=>s+(+e.mood||0),0)/filtered.length).toFixed(2) : '–';
     $('#sumMood') && ($('#sumMood').textContent = filtered.length? avgMood : '–');
     $('#sumTopEmo') && ($('#sumTopEmo').textContent = topByCount(filtered.flatMap(e=>e.emotions)) || '–');
     $('#sumThemes') && ($('#sumThemes').textContent = topByCount(filtered.map(e=>e.theme).filter(Boolean)) || '–');
   
     const tl = document.getElementById('timeline'); if(tl){ tl.innerHTML = ''; filtered.slice().reverse().forEach(e=>{
       const dot = document.createElement('div'); dot.className = 'jc-dot mood-'+(e.mood||3); dot.title = `${e.date} • Mood ${e.mood||'-'}`; tl.appendChild(dot);
     });}
   
     const words = wordCounts(filtered.map(e=>e.text).join(' '));
     const topWords = Object.entries(words).sort((a,b)=>b[1]-a[1]).slice(0,16);
     const trends = document.getElementById('wordTrends'); if(trends){ trends.innerHTML=''; topWords.forEach(([w,c])=>{
       const b = document.createElement('span'); b.className = 'badge'; b.textContent = `${w} (${c})`; trends.appendChild(b);
     });}
   
     const asc = filtered.slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
     const st = calcStreaks(asc);
     $('#currentStreak') && ($('#currentStreak').textContent = `Streak: ${st.cur} day${st.cur===1?'':'s'}`);
     $('#bestStreak')    && ($('#bestStreak').textContent    = `Best: ${st.best} day${st.best===1?'':'s'}`);
   
     renderMonthBar();
   
     const listEl = document.getElementById('entriesList'); 
     if(listEl){
       listEl.innerHTML='';
       filtered.forEach(e=>{
         const card = document.createElement('div'); card.className = 'jc-card';
         const emos = (e.emotions||[]).map(x=>`<span class="badge">${escapeHtml(x)}</span>`).join(' ');
         const grats = (e.gratitude||[]).map(g=>`• ${escapeHtml(g)}`).join('<br>');
         const goods = (e.pos?.good||[]).map(g=>`• ${escapeHtml(g)}`).join('<br>');
         const tags  = (e.tags||[]).map(t=>`<span class="badge blue">${escapeHtml(t)}</span>`).join(' ');
         card.innerHTML = `
           <h3>${e.date} ${e.star? '⭐':''} ${e.theme?`<span class="badge">${escapeHtml(e.theme)}</span>`:''}</h3>
           <div class="jc-kv">
             <div class="jc-muted">Mood</div><div>${e.mood||'-'}</div>
             <div class="jc-muted">Energy</div><div>${e.energy||'-'}</div>
             <div class="jc-muted">Sleep</div><div>${e.sleep??'-'} hrs</div>
             <div class="jc-muted">Stress</div><div>${e.stress??'-'}/5</div>
             <div class="jc-muted">Emotions</div><div>${emos||'-'}</div>
           </div>
           <div class="jc-divider"></div>
           <p>${nl2br(escapeHtml(e.text||'')) || '<em class="jc-muted">No free-write today.</em>'}</p>
           ${grats?`<div class="jc-divider"></div><strong>Gratitude</strong><div class="jc-list">${grats}</div>`:''}
           ${goods?`<div class="jc-divider"></div><strong>Good Things</strong><div class="jc-list">${goods}</div>`:''}
           ${e.pos?.proud?`<div class="jc-divider"></div><strong>Proud Of</strong><p>${escapeHtml(e.pos.proud)}</p>`:''}
           ${(e.photos&&e.photos.length)?`<div class="jc-divider"></div><div class="jc-row">`+ e.photos.map(p=>`<img src="${p}" style="max-width:90px;border-radius:8px;" alt="attached photo">`).join('')+ `</div>`:''}
           ${tags?`<div class="jc-divider"></div>${tags}`:''}
           <div class="jc-actions" style="margin-top:8px;">
             <button class="jc-btn" onclick="editEntry('${e.id}')">Edit</button>
             <button class="jc-btn" onclick="toggleStar('${e.id}')">${e.star?'Unstar':'Star'}</button>
             <button class="jc-btn" onclick="deleteEntry('${e.id}')">Delete</button>
           </div>
         `;
         listEl.appendChild(card);
       });
     }
   
     generateStoryText(asc, false);
   
     const badges = computeBadges(asc);
     const br = document.getElementById('badgesRow'); if(br) br.innerHTML = badges.map(b=>`<span class="badge">${b}</span>`).join(' ');
   
     // Also keep Home snapshot fresh
     updateHomeSnapshot();
   }
   
   /* =========================
      STORY GENERATOR
      ========================= */
   document.getElementById('generateStory')?.addEventListener('click', ()=>{
     const filtered = currentFiltered();
     generateStoryText(filtered, true);
   });
   function generateStoryText(list, showBadge){
     const out = document.getElementById('storyOut');
     if(!out) return;
     if(!list.length){ out.innerHTML = '<em class="jc-muted">No entries in this range yet.</em>'; return; }
   
     const first = list[0], last = list[list.length-1];
     const avgMood = (list.reduce((s,e)=>s+(+e.mood||0),0)/list.length || 0).toFixed(2);
     const topEmo  = topByCount(list.flatMap(e=>e.emotions));
     const topTheme = topByCount(list.map(e=>e.theme).filter(Boolean));
     const goodCount = list.reduce((s,e)=> s + ((e.pos?.good||[]).length), 0);
     const proudSnips = list.map(e=>e.pos?.proud).filter(Boolean).slice(-3);
     const obstacles = topByCount(list.map(e=>e.stress>=4?'High Stress':null).filter(Boolean)) || '—';
   
     const textAll = list.map(e=>e.text||'').join(' ').toLowerCase();
     const posHits = countMatches(textAll, ['grateful','progress','proud','calm','love','hope','win','growth','peace','learn']);
     const negHits = countMatches(textAll, ['anxious','angry','tired','stressed','overwhelmed','sad','lonely','stuck','fear']);
     const tone = posHits>=negHits ? 'steadily strengthening' : 'courageous through challenges';
   
     const rangeLabel = (filterFrom||filterTo) ? `${formatDate(first.date)} → ${formatDate(last.date)}` : `All time through ${formatDate(last.date)}`;
     const note = (I18N[LANG]||I18N.en).story_note;
   
     const paragraphs = [
       `From <strong>${rangeLabel}</strong>, you created <strong>${list.length}</strong> entries and kept showing up. Your average mood was <strong>${avgMood}</strong>, with <strong>${topEmo||'varied emotions'}</strong> appearing most. Overall tone: <strong>${tone}</strong>.`,
       `Your reflections centered on <strong>${topTheme||'a mix of themes'}</strong>. You named <strong>${goodCount}</strong> “good things,” and your proud moments included: ${proudSnips.length? proudSnips.map(s=>`“${escapeHtml(s)}”`).join(' — ') : 'quiet, consistent effort.'}`,
       `Obstacles showed up as <strong>${obstacles}</strong>, yet your entries show you practicing awareness (CBT/ACT/mindfulness) and returning to your values.`,
       `A note to future you: <em>${escapeHtml(note)}</em>`
     ];
     out.innerHTML = `<p>${paragraphs.join('</p><p>')}</p>`;
     if(showBadge) flash('#storyBadge');
   }
   
   /* =========================
      ENCRYPTION (WebCrypto AES-GCM with PBKDF2)
      ========================= */
   async function deriveKey(pass, salt){
     const enc = new TextEncoder();
     const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
     return crypto.subtle.deriveKey(
       {name:'PBKDF2', salt, iterations: 120000, hash:'SHA-256'},
       keyMaterial,
       {name:'AES-GCM', length:256},
       false,
       ['encrypt','decrypt']
     );
   }
   async function lockVault(){
     const pass = prompt('Create a passphrase (save it safely):');
     if(!pass) return;
     const enc = new TextEncoder();
     const salt = crypto.getRandomValues(new Uint8Array(16));
     const iv   = crypto.getRandomValues(new Uint8Array(12));
     const key  = await deriveKey(pass, salt);
     const data = enc.encode(JSON.stringify(entries));
     const ct   = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, data);
     const payload = { salt: Array.from(salt), iv: Array.from(iv), ct: Array.from(new Uint8Array(ct)) };
     localStorage.setItem(vaultKey, JSON.stringify(payload));
     entries = []; save(entriesKey, entries);
     locked = true;
     alert('Vault locked. Entries removed from visible storage.');
     render();
   }
   async function unlockVault(){
     const blob = localStorage.getItem(vaultKey);
     if(!blob) { alert('No encrypted vault found.'); return; }
     const pass = prompt('Enter passphrase:');
     if(!pass) return;
     try{
       const payload = JSON.parse(blob);
       const salt = new Uint8Array(payload.salt);
       const iv   = new Uint8Array(payload.iv);
       const ct   = new Uint8Array(payload.ct);
       const key  = await deriveKey(pass, salt);
       const pt   = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct);
       const dec  = new TextDecoder().decode(pt);
       entries    = JSON.parse(dec);
       save(entriesKey, entries);
       locked = false;
       alert('Vault unlocked.');
       applyFilterFromPreset(); refreshThemeSelects(); render();
     }catch(e){
       alert('Decryption failed. Passphrase may be incorrect.');
     }
   }
   document.getElementById('lockBtn')?.addEventListener('click', lockVault);
   document.getElementById('unlockBtn')?.addEventListener('click', unlockVault);
   
   /* =========================
      TABS
      ========================= */
   const tabButtons = document.querySelectorAll('.tab-btn');
   const sections = {
     home:     document.getElementById('tab-home'),
     journal:  document.getElementById('tab-journal'),
     insights: document.getElementById('tab-insights'),
     templates:document.getElementById('tab-templates'),
     library:  document.getElementById('tab-library'),
     goals:    document.getElementById('tab-goals'),
     reviews:  document.getElementById('tab-reviews'),
     settings: document.getElementById('tab-settings'),
     reminders:document.getElementById('tab-reminders')
   };
   function setTab(name){
     Object.entries(sections).forEach(([k,el])=>{ if(el) el.style.display = (k===name)?'block':'none'; });
     tabButtons.forEach(b=> b.classList.toggle('is-active', b.dataset.tab===name));
     const h = sections[name]?.querySelector('h2,h3'); h?.focus?.();
     if(name==='home') updateHomeSnapshot();
   }
   tabButtons.forEach(b=> b.addEventListener('click', ()=> setTab(b.dataset.tab)));
   setTab('journal');
   
   // Keyboard quick switch (Alt+1..5)
   document.addEventListener('keydown', (e)=>{
     if(!e.altKey) return;
     if(e.key==='1') setTab('journal');
     if(e.key==='2') setTab('goals');
     if(e.key==='3') setTab('reviews');
     if(e.key==='4') setTab('settings');
     if(e.key==='5') setTab('reminders');
   });
   
   /* =========================
      SETTINGS: Custom Banks & Branding
      ========================= */
   (function initBanksUI(){
     const b = loadBanks();
     const ce = document.getElementById('customEmotions');
     const ct = document.getElementById('customThemes');
     if(ce) ce.value = b.emotions.join(', ');
     if(ct) ct.value = b.themes.join(', ');
   })();
   document.getElementById('saveBanks')?.addEventListener('click', ()=>{
     const emos = document.getElementById('customEmotions').value.split(',').map(x=>x.trim()).filter(Boolean);
     const thms = document.getElementById('customThemes').value.split(',').map(x=>x.trim()).filter(Boolean);
     const b = { emotions: emos, themes: thms };
     saveBanks(b);
     refreshEmotionChips();
     refreshThemeSelects();
     alert('Lists saved.');
   });
   document.getElementById('resetBanks')?.addEventListener('click', ()=>{
     localStorage.removeItem(banksKey);
     location.reload();
   });
   document.getElementById('saveBrand')?.addEventListener('click', ()=>{
     const b = { name: document.getElementById('brandName').value || 'Life Compass Pro',
                 accent: document.getElementById('brandAccent').value || '#3a7f6f' };
     localStorage.setItem(brandKey, JSON.stringify(b));
     applyBrand();
     alert('Branding saved.');
   });
   
   /* =========================
      GOALS
      ========================= */
   function saveGoals(){ save(goalsKey, goals); renderGoals(); }
   document.getElementById('saveGoal')?.addEventListener('click', ()=>{
     const g = {
       id: 'g_'+Date.now(),
       title: document.getElementById('goalTitle').value.trim(),
       why: document.getElementById('goalWhy').value.trim(),
       tags: document.getElementById('goalTags').value.split(',').map(s=>s.trim()).filter(Boolean),
       due:  document.getElementById('goalDue').value || null,
       target: +document.getElementById('goalTarget').value || 1,
       period: document.getElementById('goalPeriod').value || 'week',
       done: false
     };
     if(!g.title){ alert('Give your goal a title.'); return; }
     goals.push(g); saveGoals();
     document.getElementById('clearGoal')?.click();
   });
   document.getElementById('clearGoal')?.addEventListener('click', ()=>{
     ['goalTitle','goalWhy','goalTags','goalDue'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
     const tgt=document.getElementById('goalTarget'); if(tgt) tgt.value = 5;
     const per=document.getElementById('goalPeriod'); if(per) per.value = 'week';
   });
   function deleteGoal(id){ goals = goals.filter(g=>g.id!==id); saveGoals(); }
   function toggleGoalDone(id){ const i = goals.findIndex(g=>g.id===id); if(i>=0){ goals[i].done=!goals[i].done; saveGoals(); } }
   
   function evidenceForGoal(g){
     // Count entries that contain any of the goal tags in the selected period (last 7/30 days)
     const mapPeriodToDays = { week: 7, month: 30 };
     const days = mapPeriodToDays[g.period] || 7;
     const from = new Date(); from.setDate(from.getDate()-days+1);
     const list = entries.filter(e=>{
       const d = new Date(e.date);
       if(d < from) return false;
       const bag = ((e.tags||[]).join(' ') + ' ' + (e.text||'')).toLowerCase();
       return g.tags.some(t=> t && bag.includes(t.toLowerCase()));
     });
     return { count: list.length, sample: list.slice(-3) };
   }
   function renderGoals(){
     const host = document.getElementById('goalsList'); if(!host) return;
     host.innerHTML='';
     goals.forEach(g=>{
       const ev = evidenceForGoal(g);
       const card = document.createElement('div'); card.className='jc-card';
       card.innerHTML = `
         <h4>${g.done?'✅ ':''}${escapeHtml(g.title)}</h4>
         <p class="jc-muted">${escapeHtml(g.why||'')}</p>
         <div class="jc-kv">
           <div class="jc-muted">Tags</div><div>${(g.tags||[]).map(t=> `<span class="badge">${escapeHtml(t)}</span>`).join(' ')||'-'}</div>
           <div class="jc-muted">Target</div><div>${g.target}/${g.period}</div>
           <div class="jc-muted">Due</div><div>${g.due||'-'}</div>
           <div class="jc-muted">Evidence</div><div><strong>${ev.count}</strong> this ${g.period}${ev.sample.length?'<br>'+ev.sample.map(e=> `<span class="badge blue">${e.date}</span>`).join(' '):''}</div>
         </div>
         <div class="jc-actions" style="margin-top:8px;">
           <button class="jc-btn" onclick="toggleGoalDone('${g.id}')">${g.done?'Mark Active':'Mark Done'}</button>
           <button class="jc-btn" onclick="deleteGoal('${g.id}')">Delete</button>
         </div>
       `;
       host.appendChild(card);
     });
   }
   
   /* =========================
      REVIEWS (every 14 days)
      ========================= */
   function daysBetween(a,b){ return Math.round((endOfDay(b)-startOfDay(a)) / (1000*60*60*24)); }
   function nextReviewDate(){
     const last = localStorage.getItem(reviewKey);
     const base = last ? new Date(last) : new Date();
     const next = new Date(base); next.setDate(next.getDate()+14);
     return next;
   }
   function updateNextReviewHint(){
     const next = nextReviewDate();
     const el = document.getElementById('nextReviewHint');
     if(el) el.textContent = 'Next review: '+ next.toLocaleDateString();
   }
   updateNextReviewHint();
   
   document.getElementById('genReviewNow')?.addEventListener('click', ()=>{
     const to = new Date(); const from = new Date(); from.setDate(from.getDate()-13);
     const list = entries.filter(e=>{
       const d = new Date(e.date); return d>=startOfDay(from) && d<=endOfDay(to);
     }).sort((a,b)=> new Date(a.date)-new Date(b.date));
     const out = document.getElementById('reviewOut');
     if(!out) return;
     if(!list.length){ out.innerHTML = '<em class="jc-muted">No entries in the last 14 days.</em>'; return; }
     const avgMood = (list.reduce((s,e)=>s+(+e.mood||0),0)/list.length || 0).toFixed(2);
     const topEmo = topByCount(list.flatMap(e=>e.emotions));
     const topTheme = topByCount(list.map(e=>e.theme).filter(Boolean));
     const wins = list.flatMap(e=> (e.pos?.good||[])).slice(-5);
     const proud = list.map(e=>e.pos?.proud).filter(Boolean).slice(-3);
     const advice = [
       "Double down on what worked on your best days.",
       "Schedule a 10-minute micro-win at the same time daily.",
       "Reduce friction: prep the night before for tomorrow’s you.",
       "Replace one negative thought with a realistic reframe.",
       "End days by noting one lesson and one thank-you."
     ];
     out.innerHTML = `
       <p><strong>Biweekly snapshot</strong>: ${list.length} entries • avg mood <strong>${avgMood}</strong> • most frequent emotion <strong>${topEmo||'—'}</strong> • main theme <strong>${topTheme||'—'}</strong>.</p>
       ${wins.length? `<p><strong>Recent wins:</strong> ${wins.map(w=>`“${escapeHtml(w)}”`).join(' — ')}</p>`:''}
       ${proud.length? `<p><strong>Proud of:</strong> ${proud.map(w=>`“${escapeHtml(w)}”`).join(' — ')}</p>`:''}
       <p><strong>Suggestions:</strong> ${advice.join(' • ')}</p>
     `;
     localStorage.setItem(reviewKey, new Date().toISOString().slice(0,10));
     updateNextReviewHint();
   });
   
   /* =========================
      REMINDERS (Notifications API)
      ========================= */
   let remTimer=null;
   async function startReminders(){
     const mins = Math.max(5, +document.getElementById('remEvery').value || 60);
     const msg  = document.getElementById('remMsg').value || 'Journal check-in';
     if(!('Notification' in window)) { alert('Notifications not supported in this browser.'); return; }
     let perm = Notification.permission;
     if(perm !== 'granted'){
       perm = await Notification.requestPermission();
       if(perm !== 'granted'){ alert('Permission denied.'); return; }
     }
     if(remTimer) clearInterval(remTimer);
     remTimer = setInterval(()=> new Notification(msg), mins*60*1000);
     document.getElementById('remStatus').textContent = `Every ${mins} min`;
   }
   function stopReminders(){
     if(remTimer) clearInterval(remTimer);
     remTimer = null; document.getElementById('remStatus').textContent = 'Stopped';
   }
   document.getElementById('startRem')?.addEventListener('click', startReminders);
   document.getElementById('stopRem')?.addEventListener('click', stopReminders);
   
   /* =========================
      HOME SNAPSHOT
      ========================= */
   function updateHomeSnapshot(){
     const homeCount = document.getElementById('homeTodayCount');
     const homeMood  = document.getElementById('homeTodayMood');
     const homeEmo   = document.getElementById('homeTodayEmo');
     const homeRecent= document.getElementById('homeRecent');
     if(!homeCount && !homeRecent) return;
   
     const today = todayYMD();
     const todays = entries.filter(e=> e.date===today);
     if(homeCount) homeCount.textContent = todays.length;
     if(homeMood)  homeMood.textContent  = todays.length ? (todays.reduce((s,e)=>s+(+e.mood||0),0)/todays.length).toFixed(2) : '–';
     if(homeEmo)   homeEmo.textContent   = todays.length ? (topByCount(todays.flatMap(e=>e.emotions)) || '—') : '—';
   
     if(homeRecent){
       homeRecent.innerHTML='';
       const last5 = entries.slice().sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,5);
       last5.forEach(e=>{
         const r = document.createElement('div'); r.className='jc-row'; r.style.justifyContent='space-between';
         r.innerHTML = `<span>${e.date} ${e.theme?`· <span class="badge">${escapeHtml(e.theme)}</span>`:''}</span><span class="jc-muted">m:${e.mood??'-'}</span>`;
         homeRecent.appendChild(r);
       });
       if(!last5.length) homeRecent.innerHTML = '<div class="jc-muted">No entries yet.</div>';
     }
   }
   
   /* =========================
      LANGUAGE SELECT INIT (again for safety)
      ========================= */
   document.getElementById('languageSelect') && (document.getElementById('languageSelect').value = LANG);
   
   /* =========================
      STORY BUTTON
      ========================= */
   document.getElementById('generateStory')?.addEventListener('click', ()=>{
     generateStoryText(currentFiltered(), true);
   });
   
   /* =========================
      INITIALIZE FILTERS & RENDER & GOALS
      ========================= */
   applyFilterFromPreset(); // sets default window
   render();                // draws everything once
   renderGoals();           // show goals
   updateHomeSnapshot();    // home dashboard