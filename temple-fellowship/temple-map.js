// temple-map.js
// Handles temple rendering + map + logging

document.addEventListener("DOMContentLoaded", () => {
    if (typeof L === "undefined") {
      console.error("Leaflet missing!");
      return;
    }
  
    if (typeof TEMPLE_DATA === "undefined") {
      console.error("Temple data not loaded!");
      return;
    }
  
    const listEl = document.getElementById("temple-list");
    const search = document.getElementById("search");
    const region = document.getElementById("region");
    const totalEl = document.getElementById("total-visits");
    const map = L.map("map").setView([20, 0], 2);
  
    // Load map tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      minZoom: 2,
      maxZoom: 18
    }).addTo(map);
  
    const visits = JSON.parse(localStorage.getItem("templeVisits") || "{}");
    const markers = [];
  
    function updateTotal() {
      const total = Object.values(visits).reduce((a, b) => a + b, 0);
      if (totalEl) totalEl.textContent = total;
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
      render(TEMPLE_DATA);
    }
  
    function addMarker(t) {
      if (!t.lat || !t.lng) return;
      const marker = L.marker([t.lat, t.lng])
        .addTo(map)
        .bindPopup(
          `<b>${t.name}</b><br>${t.city}, ${t.country}<br>${t.status}<br>
          <button class="log-btn" onclick="logVisitFromMap('${t.slug}')">Log Visit</button>`
        );
      markers.push(marker);
    }
  
    window.logVisitFromMap = slug => {
      const temple = TEMPLE_DATA.find(t => t.slug === slug);
      if (temple) logVisit(slug, temple.name);
    };
  
    function clearMarkers() {
      markers.forEach(m => map.removeLayer(m));
      markers.length = 0;
    }
  
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
          <p>${t.city}, ${t.country} • ${t.region}</p>
          <p><strong>Status:</strong> ${t.status}</p>
          <p><strong>Visits:</strong> ${vCount}</p>
          <button class="log-btn" data-slug="${t.slug}" data-name="${t.name}">Log Visit</button>
        `;
        listEl.appendChild(card);
  
        addMarker(t);
        if (t.lat && t.lng) coords.push([t.lat, t.lng]);
      });
  
      document.querySelectorAll(".log-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const { slug, name } = e.target.dataset;
          logVisit(slug, name);
        });
      });
  
      if (coords.length) map.fitBounds(coords, { padding: [40, 40] });
    }
  
    function applyFilter() {
      const q = search.value.trim().toLowerCase();
      const r = region.value;
      const filtered = TEMPLE_DATA.filter(t => {
        const matchQ =
          !q ||
          [t.name, t.city, t.country].some(v =>
            v.toLowerCase().includes(q)
          );
        const matchR = !r || t.region === r;
        return matchQ && matchR;
      });
      render(filtered);
    }
  
    search.addEventListener("input", applyFilter);
    region.addEventListener("change", applyFilter);
  
    render(TEMPLE_DATA);
    updateTotal();
  });