// js/background-music.js
(() => {
    // ======== Available Music Tracks ========
    const TRACKS = [
      {file: "calm-piano.mp3", name: "Calm Piano"},
      {file: "temple-wind.mp3", name: "Temple Wind"},
      {file: "rain-reflection.mp3", name: "Rain Reflection"},
      {file: "harp-peace.mp3", name: "Harp Peace"},
      {file: "dawn-softness.mp3", name: "Dawn Softness"},
      {file: "night-prayer.mp3", name: "Night Prayer"},
      {file: "soft-strings.mp3", name: "Soft Strings"},
      {file: "peaceful-breeze.mp3", name: "Peaceful Breeze"},
      {file: "healing-choir.mp3", name: "Healing Choir"},
      {file: "morning-light.mp3", name: "Morning Light"},
      {file: "serenity-harp.mp3", name: "Serenity Harp"},
      {file: "inner-fire.mp3", name: "Inner Fire"},
      {file: "faith-rising.mp3", name: "Faith Rising"},
    ];
  
    // ======== Load Last Selected Track ========
    const last = localStorage.getItem("mlcs_music_choice") || TRACKS[0].file;
    const audio = new Audio(`music/${last}`);
    audio.loop = true;
    audio.volume = parseFloat(localStorage.getItem("mlcs_music_vol") || "0.3");
  
    // ======== Auto-Start After Click (browser policy) ========
    const enableAudio = () => {
      audio.play().catch(() => console.log("Autoplay blocked until click"));
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("click", enableAudio);
  
    // ======== Create Floating Player UI ========
    const wrap = document.createElement("div");
    wrap.id = "music-player";
    wrap.innerHTML = `
      <select id="musicSelect" style="margin-right:6px; padding:6px; border-radius:8px;">
        ${TRACKS.map(t => `<option value="${t.file}">${t.name}</option>`).join("")}
      </select>
      <button id="toggleMusic" style="padding:6px 12px;">⏸ Pause</button>
    `;
    Object.assign(wrap.style, {
      position: "fixed",
      bottom: "16px",
      right: "16px",
      zIndex: 2000,
      background: "rgba(255,255,255,0.9)",
      border: "2px solid #2563eb",
      borderRadius: "12px",
      padding: "8px",
      display: "flex",
      alignItems: "center",
      fontFamily: "system-ui",
    });
    document.body.appendChild(wrap);
  
    // ======== Bind Events ========
    const sel = wrap.querySelector("#musicSelect");
    sel.value = last;
  
    sel.addEventListener("change", e => {
      const file = e.target.value;
      audio.src = `music/${file}`;
      localStorage.setItem("mlcs_music_choice", file);
      audio.play();
    });
  
    const btn = wrap.querySelector("#toggleMusic");
    let playing = true;
    btn.onclick = () => {
      playing ? audio.pause() : audio.play();
      btn.textContent = playing ? "▶︎ Play" : "⏸ Pause";
      playing = !playing;
    };
  
    // Optional: keyboard volume control
    document.addEventListener("keydown", e => {
      if (e.key === "+" || e.key === "=") audio.volume = Math.min(1, audio.volume + 0.05);
      if (e.key === "-") audio.volume = Math.max(0, audio.volume - 0.05);
      localStorage.setItem("mlcs_music_vol", audio.volume.toFixed(2));
    });
  })();