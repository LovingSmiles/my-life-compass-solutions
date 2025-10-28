const KEY_TRIPS = 'tfn_trips';

function loadTrips(){
  try { return JSON.parse(localStorage.getItem(KEY_TRIPS) || '[]'); }
  catch { return []; }
}
function saveTrips(list){
  localStorage.setItem(KEY_TRIPS, JSON.stringify(list));
}
function addTrip(trip){
  const list = loadTrips();
  list.push(trip);
  saveTrips(list);
}

function fmtDate(dtStr){
  if(!dtStr) return '';
  try{
    const d = new Date(dtStr);
    return d.toLocaleString();
  }catch{ return dtStr; }
}

function renderTrips(){
  const wrap = document.getElementById('trip-list');
  if(!wrap) return;
  const list = loadTrips();
  wrap.innerHTML = '';
  if(!list.length){
    wrap.innerHTML = '<div class="card center">No trips yet. <a class="btn" href="join-trip.html">Start a Trip</a></div>';
    return;
  }
  // sort upcoming first
  list.sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
  list.forEach(t=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${t.title || 'Temple Trip'}</h3>
      <p><strong>Temple:</strong> ${t.temple || ''}</p>
      <p><strong>Date/Time:</strong> ${fmtDate(t.datetime)}</p>
      <p>${t.notes ? t.notes.replace(/\n/g,'<br>') : ''}</p>
    `;
    wrap.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderTrips);