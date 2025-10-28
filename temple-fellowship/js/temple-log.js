// temple-log.js — Full Temple Visit Logger & Tracker (with date, time, and unique stats)
(function(){
    const STORAGE_KEY = "temple_visits_log";
  
    // ===== Helpers =====
    function readVisits(){
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
      catch { return []; }
    }
  
    function saveVisits(data){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  
    function formatDateTime(){
      const d = new Date();
      const date = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      return `${date} ${time}`;
    }
  
    // ===== Record a new temple visit =====
    window.recordTempleVisit = function(templeName){
      const visits = readVisits();
      const now = formatDateTime();
  
      visits.push({ temple: templeName, datetime: now });
      saveVisits(visits);
  
      updateLastVisit();
      updateVisitHistory();
  
      alert(`✅ Logged visit to ${templeName} on ${now}`);
    };
  
    // ===== Get stats =====
    function getStats(){
      const visits = readVisits();
      const uniqueTemples = new Set(visits.map(v => v.temple)).size;
      const totalVisits = visits.length;
      return { totalVisits, uniqueTemples };
    }
  
    // ===== Last visit info =====
    function getLastVisit(){
      const visits = readVisits();
      if (!visits.length) return null;
      return visits[visits.length - 1];
    }
  
    function updateLastVisit(){
      const el = document.getElementById("lastVisitDisplay");
      if (!el) return;
      const last = getLastVisit();
      const { totalVisits, uniqueTemples } = getStats();
  
      el.innerHTML = last
        ? `
          🕊️ <strong>Last Visited:</strong> ${last.temple}<br>
          <em>${last.datetime}</em><br><br>
          📍 You’ve visited <strong>${uniqueTemples}</strong> unique temples
          across <strong>${totalVisits}</strong> total visits.
        `
        : `No temple visits logged yet.`;
    }
  
    // ===== Visit history table =====
    function updateVisitHistory(){
      const container = document.getElementById("visitHistory");
      if (!container) return;
  
      const visits = readVisits();
      if (!visits.length) {
        container.innerHTML = "<p>No temple visits recorded yet.</p>";
        return;
      }
  
      // Group visits by temple
      const grouped = {};
      visits.forEach(v => {
        if (!grouped[v.temple]) grouped[v.temple] = [];
        grouped[v.temple].push(v.datetime);
      });
  
      // Sort temples alphabetically
      const templeNames = Object.keys(grouped).sort((a,b) => a.localeCompare(b));
  
      // Build table
      let html = `
        <table class="temple-log-table">
          <thead>
            <tr>
              <th>Temple</th>
              <th>Visits</th>
              <th>Most Recent Visit</th>
            </tr>
          </thead>
          <tbody>
      `;
  
      templeNames.forEach(t => {
        const dates = grouped[t].sort((a,b)=> new Date(b) - new Date(a));
        html += `
          <tr>
            <td>${t}</td>
            <td>${dates.length}</td>
            <td>${dates[0]}</td>
          </tr>
        `;
      });
  
      html += "</tbody></table>";
      container.innerHTML = html;
    }
  
    // ===== Clear all logs =====
    window.clearTempleLog = function(){
      if (confirm("Are you sure you want to clear all temple visit records?")) {
        localStorage.removeItem(STORAGE_KEY);
        updateLastVisit();
        updateVisitHistory();
        alert("🗑️ All temple visit logs cleared.");
      }
    };
  
    // ===== Initialize on load =====
    document.addEventListener("DOMContentLoaded", () => {
      updateLastVisit();
      updateVisitHistory();
    });
  })();