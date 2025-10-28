/**************************************************
 * temples.js — Logic for map, filters, search & visits
 * Works with temple-data.js and temples.html
 **************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");
  const regionSel = document.getElementById("region");
  const countrySel = document.getElementById("country");
  const stateSel = document.getElementById("state");
  const stateLabel = document.getElementById("state-label");
  const listEl = document.getElementById("temple-list");
  const totalEl = document.getElementById("total-visits");

  /***********************
   * Populate Region Dropdown
   ***********************/
  const regions = [...new Set(TEMPLE_DATA.map(t => t.region))].sort();
  regions.forEach(r => regionSel.insertAdjacentHTML("beforeend", `<option>${r}</option>`));

  /***********************
   * Map Setup
   ***********************/
  const map = L.map("map").setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    minZoom: 2,
    maxZoom: 18
  }).addTo(map);

  const markers = [];
  const visits = JSON.parse(localStorage.getItem("templeVisits") || "{}");

  /***********************
   * Utility Functions
   ***********************/
  function updateTotal() {
    const total = Object.values(visits).reduce((a, b) => a + b, 0);
    totalEl.textContent = total;
  }

  function saveVisits() {
    localStorage.setItem("templeVisits", JSON.stringify(visits));
    updateTotal();
  }

  function logVisit(slug, name) {
    if (!visits[slug]) visits[slug] = 0;
    visits[slug]++;
    saveVisits();
    alert(`✅ Visit logged for ${name}. Total visits: ${visits[slug]}`);
    render(currentItems);
  }
  window.logVisit = logVisit;

  function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers.length = 0;
  }

  function addMarker(t) {
    if (typeof t.lat !== "number" || typeof t.lng !== "number") return;
    const marker = L.marker([t.lat, t.lng])
      .addTo(map)
      .bindPopup(`
        <b>${t.name}</b><br>
        ${[t.city, t.state, t.country].filter(Boolean).join(", ")}<br>
        ${t.status || ""}<br>
        <button class="log-btn" onclick="logVisit('${t.slug}','${t.name}')">Log Visit</button>
      `);
    markers.push(marker);
  }

  /***********************
   * Rendering
   ***********************/
  let currentItems = TEMPLE_DATA.slice();

  function render(items) {
    clearMarkers();
    listEl.innerHTML = "";
    const coords = [];

    items.forEach(t => {
      const vCount = visits[t.slug] || 0;
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${t.name}</h3>
        <p>${[t.city, t.state, t.country].filter(Boolean).join(", ")}</p>
        <p><strong>Status:</strong> ${t.status || ""}</p>
        <p><strong>Visits:</strong> ${vCount}</p>
        <button class="log-btn" onclick="logVisit('${t.slug}','${t.name}')">Log Visit</button>
      `;
      listEl.appendChild(card);
      addMarker(t);
      if (typeof t.lat === "number" && typeof t.lng === "number")
        coords.push([t.lat, t.lng]);
    });

    if (coords.length) map.fitBounds(coords, { padding: [40, 40] });
  }

  /***********************
   * Filters
   ***********************/
  function applyFilter() {
    const q = search.value.trim().toLowerCase();
    const region = regionSel.value;
    const country = countrySel.value;
    const state = stateSel.value;

    currentItems = TEMPLE_DATA.filter(t => {
      const hay = [t.name, t.city, t.state, t.country].join(" ").toLowerCase();
      const matchQ = !q || hay.includes(q);
      const matchR = !region || t.region === region;
      const matchC = !country || t.country === country;
      const matchS = !state || t.state === state;
      return matchQ && matchR && matchC && matchS;
    });

    render(currentItems);
  }

  regionSel.addEventListener("change", () => {
    const region = regionSel.value;
    const countries = [...new Set(TEMPLE_DATA
      .filter(t => !region || t.region === region)
      .map(t => t.country))].sort();
    countrySel.innerHTML = `<option value="">All Countries</option>` + countries.map(c => `<option>${c}</option>`).join("");
    stateSel.style.display = stateLabel.style.display = "none";
    applyFilter();
  });

  countrySel.addEventListener("change", () => {
    const country = countrySel.value;
    if (country === "USA") {
      const states = [...new Set(TEMPLE_DATA.filter(t => t.country === "USA").map(t => t.state))].sort();
      stateSel.innerHTML = `<option value="">All States</option>` + states.map(s => `<option>${s}</option>`).join("");
      stateSel.style.display = stateLabel.style.display = "block";
    } else {
      stateSel.style.display = stateLabel.style.display = "none";
    }
    applyFilter();
  });

  stateSel.addEventListener("change", applyFilter);
  search.addEventListener("input", applyFilter);

  /***********************
   * Initial Load
   ***********************/
  render(currentItems);
  updateTotal();
});