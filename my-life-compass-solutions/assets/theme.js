// LCP Theme v4 — Page or Sitewide, Color/Image/Both, Unlimited Images
// Default color: Light Ocean Blue (#7fd3f7)
// My Life Compass Solutions — by LovingSmiles

(function (window, document) {
  const LCPTheme = {
    init(opts = {}) {
      const {
        mount = null,                  // element or selector to render controls (optional if using settings page)
        keyPrefix = "lcp_theme",
        defaultColor = "#7fd3f7",
        autoApply = true,
        managePath = null              // when used on theme-settings.html, we override the PATH by selection
      } = opts;

      const getPath = () => (managePath || location.pathname || "page").toLowerCase();

      // Key helpers
      const K = {
        pageColor:   (p) => `${keyPrefix}_color_page_${p}`,
        pageImage:   (p) => `${keyPrefix}_image_page_${p}`,  // active image id (NOT dataUrl)
        pageImages:  (p) => `${keyPrefix}_images_page_${p}`, // array of {id,dataUrl,name,ts}
        pageMode:    (p) => `${keyPrefix}_mode_page_${p}`,   // "color" | "image" | "both"
        pageOverlay: (p) => `${keyPrefix}_overlay_page_${p}`,

        globColor:   `${keyPrefix}_color_global`,
        globImage:   `${keyPrefix}_image_global`,             // active id
        globImages:  `${keyPrefix}_images_global`,
        globMode:    `${keyPrefix}_mode_global`,
        globOverlay: `${keyPrefix}_overlay_global`,

        lastScope:   (p) => `${keyPrefix}_last_scope_${p}`    // "page"|"global"
      };

      const read     = (k, fb = "") => localStorage.getItem(k) ?? fb;
      const write    = (k, v)      => localStorage.setItem(k, v);
      const del      = (k)         => localStorage.removeItem(k);
      const readJSON = (k, fb)     => { try { return JSON.parse(localStorage.getItem(k) || ""); } catch { return fb; } };

      // RGB helper for overlay
      const hexToRgb = (hex) => {
        const s = hex.replace("#", "");
        const n = s.length === 3 ? s.split("").map(ch => ch + ch).join("") : s;
        return { r: parseInt(n.slice(0,2),16), g: parseInt(n.slice(2,4),16), b: parseInt(n.slice(4,6),16) };
      };

      const getActiveImageDataUrl = (scope, path) => {
        if (scope === "global") {
          const images = readJSON(K.globImages, []);
          const activeId = read(K.globImage, "");
          const found = images.find(i => i.id === activeId);
          return found?.dataUrl || "";
        } else {
          const images = readJSON(K.pageImages(path), []);
          const activeId = read(K.pageImage(path), "");
          const found = images.find(i => i.id === activeId);
          return found?.dataUrl || "";
        }
      };

      function applyToBody({mode, color, imageDataUrl, overlay = 40}) {
        const b = document.body.style;
        // reset base props to avoid conflicts
        b.backgroundRepeat   = "no-repeat";
        b.backgroundPosition = "center center";
        b.backgroundSize     = "cover";

        if (!mode || mode === "color") {
          b.backgroundImage = "";
          b.backgroundColor = color || defaultColor;
          return;
        }

        if (mode === "image") {
          if (imageDataUrl) {
            b.backgroundColor = "";
            b.backgroundImage = `url(${imageDataUrl})`;
          } else {
            b.backgroundImage = "";
            b.backgroundColor = color || defaultColor;
          }
          return;
        }

        // both
        const img = imageDataUrl;
        if (img) {
          const { r, g, b: bl } = hexToRgb(color || defaultColor);
          const a = Math.max(0, Math.min(100, Number(overlay) || 0)) / 100;
          b.backgroundImage =
            `linear-gradient(rgba(${r},${g},${bl},${a}), rgba(${r},${g},${bl},${a})), url(${img})`;
          b.backgroundColor = "";
        } else {
          // fallback to color if no image yet selected
          b.backgroundImage = "";
          b.backgroundColor = color || defaultColor;
        }
      }

      function currentTheme(scope, path) {
        if (scope === "global") {
          return {
            scope: "global",
            mode:   read(K.globMode,   "color"),
            color:  read(K.globColor,  defaultColor) || defaultColor,
            overlay:read(K.globOverlay, "40") || "40",
            imageDataUrl: getActiveImageDataUrl("global", path)
          };
        }
        // page
        const pmode   = read(K.pageMode(path), "");
        const pcolor  = read(K.pageColor(path), "");
        const pover   = read(K.pageOverlay(path), "");
        if (pmode || pcolor || pover || read(K.pageImage(path), "")) {
          return {
            scope: "page",
            mode: pmode || "color",
            color: pcolor || defaultColor,
            overlay: pover || "40",
            imageDataUrl: getActiveImageDataUrl("page", path)
          };
        }
        // inherit global if exists, else defaults
        return currentTheme("global", path);
      }

      function setActiveImage(scope, path, id) {
        if (scope === "global") write(K.globImage, id);
        else write(K.pageImage(path), id);
      }

      function addImage(scope, path, file, cb) {
        const reader = new FileReader();
        reader.onload = () => {
          const item = {
            id: (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)),
            dataUrl: reader.result,
            name: file.name || "image",
            ts: Date.now()
          };
          if (scope === "global") {
            const list = readJSON(K.globImages, []);
            list.push(item);
            write(K.globImages, JSON.stringify(list));
            write(K.globImage, item.id);
          } else {
            const list = readJSON(K.pageImages(path), []);
            list.push(item);
            write(K.pageImages(path), JSON.stringify(list));
            write(K.pageImage(path), item.id);
          }
          cb && cb(item);
        };
        reader.readAsDataURL(file);
      }

      function deleteImage(scope, path, id) {
        if (scope === "global") {
          const list = readJSON(K.globImages, []);
          const next = list.filter(x => x.id !== id);
          write(K.globImages, JSON.stringify(next));
          if (read(K.globImage, "") === id) del(K.globImage);
        } else {
          const list = readJSON(K.pageImages(path), []);
          const next = list.filter(x => x.id !== id);
          write(K.pageImages(path), JSON.stringify(next));
          if (read(K.pageImage(path), "") === id) del(K.pageImage(path));
        }
      }

      // Auto apply on page load
      if (autoApply) {
        const path = getPath();
        const scope = read(K.lastScope(path), "page"); // remember last scope per page
        const th = currentTheme(scope, path);
        applyToBody(th);
      }

      // If no mount target, nothing else to render (use theme-settings.html instead)
      const mountEl = typeof opts.mount === "string" ? document.querySelector(opts.mount) : opts.mount;
      if (!mountEl) return;

      // -------- Render Controls (footer-friendly) --------
      const ui = document.createElement("div");
      ui.className = "lcp-theme";
      ui.innerHTML = `
        <div class="block">
          <h3>Apply To</h3>
          <div class="row">
            <label for="lcpScope">Scope:</label>
            <select id="lcpScope">
              <option value="page">This page</option>
              <option value="global">All pages (sitewide)</option>
            </select>
            <span id="lcpPath" style="opacity:.7;"></span>
          </div>
        </div>

        <div class="block">
          <h3>Mode & Color</h3>
          <div class="row">
            <label for="lcpMode">Mode:</label>
            <select id="lcpMode">
              <option value="color">Color only</option>
              <option value="image">Image only</option>
              <option value="both">Color + Image (overlay)</option>
            </select>
            <label for="lcpColor">Color:</label>
            <input id="lcpColor" type="color" />
            <label for="lcpOverlay">Overlay 0–100:</label>
            <input id="lcpOverlay" type="number" min="0" max="100" step="5" style="width:80px">
          </div>
        </div>

        <div class="block">
          <h3>Background Images</h3>
          <div class="row">
            <label class="image-btn" for="lcpImg">Image…</label>
            <input id="lcpImg" class="image-input" type="file" accept="image/*">
            <button type="button" id="lcpClearImg">Clear active</button>
          </div>
          <div id="lcpThumbs" class="thumbs"></div>
        </div>

        <div class="block">
          <div class="row">
            <button type="button" id="lcpResetPage">Reset This Page</button>
            <button type="button" id="lcpResetGlobal">Reset Sitewide</button>
            <button type="button" id="lcpUseGlobal">Inherit Sitewide Theme</button>
          </div>
        </div>
      `;
      mountEl.appendChild(ui);

      // Wire
      const scopeSel   = ui.querySelector("#lcpScope");
      const modeSel    = ui.querySelector("#lcpMode");
      const colorInput = ui.querySelector("#lcpColor");
      const overlayNum = ui.querySelector("#lcpOverlay");
      const imgInput   = ui.querySelector("#lcpImg");
      const thumbsBox  = ui.querySelector("#lcpThumbs");
      const pathLabel  = ui.querySelector("#lcpPath");

      // State
      function path() { return getPath(); }
      function scope() { const s = scopeSel.value; write(K.lastScope(path()), s); return s; }

      // Load defaults into UI
      scopeSel.value = read(K.lastScope(path()), "page");
      pathLabel.textContent = `(${path()})`;

      function refreshUI() {
        const s = scope();
        const th = currentTheme(s, path());
        modeSel.value = th.mode;
        colorInput.value = th.color || defaultColor;
        overlayNum.value = th.overlay || "40";
        renderThumbs();
        applyToBody(th);
      }

      function renderThumbs() {
        const s = scope();
        const list = (s === "global") ? readJSON(K.globImages, []) : readJSON(K.pageImages(path()), []);
        const activeId = (s === "global") ? read(K.globImage, "") : read(K.pageImage(path()), "");
        thumbsBox.innerHTML = "";
        if (!list.length) {
          thumbsBox.innerHTML = `<div class="fine">No saved images yet. Click “Image…” to add one.</div>`;
          return;
        }
        list.slice().reverse().forEach(item => {
          const el = document.createElement("div");
          el.className = "thumb";
          el.innerHTML = `
            <img src="${item.dataUrl}" alt="${item.name || 'background'}">
            <div class="bar">
              <button class="act" data-id="${item.id}">${item.id === activeId ? 'Active ✓' : 'Use'}</button>
              <button class="del" data-id="${item.id}">Delete</button>
            </div>
          `;
          thumbsBox.appendChild(el);
        });

        thumbsBox.onclick = (e) => {
          const idUse = e.target.closest(".act")?.dataset?.id;
          const idDel = e.target.closest(".del")?.dataset?.id;
          if (idUse) {
            setActiveImage(s, path(), idUse);
            const th = currentTheme(s, path());
            applyToBody(th);
            renderThumbs();
          }
          if (idDel) {
            deleteImage(s, path(), idDel);
            const th = currentTheme(s, path());
            applyToBody(th);
            renderThumbs();
          }
        };
      }

      // Listeners
      scopeSel.addEventListener("change", refreshUI);

      modeSel.addEventListener("change", () => {
        const s = scope();
        if (s === "global") write(K.globMode, modeSel.value);
        else write(K.pageMode(path()), modeSel.value);
        refreshUI();
      });

      colorInput.addEventListener("input", () => {
        const s = scope();
        const val = colorInput.value || defaultColor;
        if (s === "global") write(K.globColor, val);
        else write(K.pageColor(path()), val);
        refreshUI();
      });

      overlayNum.addEventListener("input", () => {
        const s = scope();
        const v = String(Math.max(0, Math.min(100, Number(overlayNum.value) || 0)));
        if (s === "global") write(K.globOverlay, v);
        else write(K.pageOverlay(path()), v);
        refreshUI();
      });

      imgInput.addEventListener("change", (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        addImage(scope(), path(), f, () => { refreshUI(); });
        imgInput.value = ""; // reset input
      });

      ui.querySelector("#lcpClearImg").addEventListener("click", () => {
        if (scope() === "global") del(K.globImage);
        else del(K.pageImage(path()));
        refreshUI();
      });

      ui.querySelector("#lcpResetPage").addEventListener("click", () => {
        del(K.pageColor(path()));
        del(K.pageMode(path()));
        del(K.pageOverlay(path()));
        del(K.pageImage(path()));
        del(K.pageImages(path()));
        refreshUI();
      });

      ui.querySelector("#lcpResetGlobal").addEventListener("click", () => {
        del(K.globColor);
        del(K.globMode);
        del(K.globOverlay);
        del(K.globImage);
        del(K.globImages);
        refreshUI();
      });

      ui.querySelector("#lcpUseGlobal").addEventListener("click", () => {
        del(K.pageColor(path()));
        del(K.pageMode(path()));
        del(K.pageOverlay(path()));
        del(K.pageImage(path()));
        del(K.pageImages(path()));
        scopeSel.value = "global";
        refreshUI();
      });

      // First render
      refreshUI();
    }
  };

  window.LCPTheme = LCPTheme;
})(window, document);