/* =====================================================
   TEMPLE DATA — OCEANIA
   Includes: Australia, New Zealand, Papua New Guinea,
   Fiji, Samoa, Tonga, Tahiti, Guam, Micronesia, etc.
   ===================================================== */

   window.temple_data_oceania = [

    /* ===== AUSTRALIA ===== */
    { region: "Oceania", country: "Australia", city: "Sydney", name: "Sydney Australia Temple", status: "🟢 Operating", lat: -33.8688, lng: 151.2093, slug: "sydney-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Melbourne", name: "Melbourne Australia Temple", status: "🟢 Operating", lat: -37.8136, lng: 144.9631, slug: "melbourne-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Perth", name: "Perth Australia Temple", status: "🟢 Operating", lat: -31.9505, lng: 115.8605, slug: "perth-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Brisbane", name: "Brisbane Australia Temple", status: "🟢 Operating", lat: -27.4698, lng: 153.0251, slug: "brisbane-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Adelaide", name: "Adelaide Australia Temple", status: "🟢 Operating", lat: -34.9285, lng: 138.6007, slug: "adelaide-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Canberra", name: "Canberra Australia Temple", status: "🔵 Announced", lat: -35.2809, lng: 149.1300, slug: "canberra-australia-temple" },
    { region: "Oceania", country: "Australia", city: "Townsville", name: "Townsville Australia Temple", status: "🔵 Announced", lat: -19.2564, lng: 146.8183, slug: "townsville-australia-temple" },
  
    /* ===== NEW ZEALAND ===== */
    { region: "Oceania", country: "New Zealand", city: "Hamilton", name: "Hamilton New Zealand Temple", status: "🟢 Operating", lat: -37.7870, lng: 175.2793, slug: "hamilton-new-zealand-temple" },
    { region: "Oceania", country: "New Zealand", city: "Wellington", name: "Wellington New Zealand Temple", status: "🔵 Announced", lat: -41.2865, lng: 174.7762, slug: "wellington-new-zealand-temple" },
    { region: "Oceania", country: "New Zealand", city: "Auckland", name: "Auckland New Zealand Temple", status: "🟡 Under Construction", lat: -36.8485, lng: 174.7633, slug: "auckland-new-zealand-temple" },
  
    /* ===== PAPUA NEW GUINEA ===== */
    { region: "Oceania", country: "Papua New Guinea", city: "Port Moresby", name: "Port Moresby Papua New Guinea Temple", status: "🟡 Under Construction", lat: -9.4438, lng: 147.1803, slug: "port-moresby-papua-new-guinea-temple" },
    { region: "Oceania", country: "Papua New Guinea", city: "Lae", name: "Lae Papua New Guinea Temple", status: "🔵 Announced", lat: -6.7273, lng: 146.9901, slug: "lae-papua-new-guinea-temple" },
  
    /* ===== FIJI ===== */
    { region: "Oceania", country: "Fiji", city: "Suva", name: "Suva Fiji Temple", status: "🟢 Operating", lat: -18.1248, lng: 178.4501, slug: "suva-fiji-temple" },
  
    /* ===== SAMOA ===== */
    { region: "Oceania", country: "Samoa", city: "Apia", name: "Apia Samoa Temple", status: "🟢 Operating", lat: -13.8333, lng: -171.7667, slug: "apia-samoa-temple" },
    { region: "Oceania", country: "Samoa", city: "Pago Pago", name: "Pago Pago American Samoa Temple", status: "🟡 Under Construction", lat: -14.2756, lng: -170.7046, slug: "pago-pago-american-samoa-temple" },
  
    /* ===== TONGA ===== */
    { region: "Oceania", country: "Tonga", city: "Nuku'alofa", name: "Nuku'alofa Tonga Temple", status: "🟢 Operating", lat: -21.1394, lng: -175.2040, slug: "nukualofa-tonga-temple" },
  
    /* ===== TAHITI (FRENCH POLYNESIA) ===== */
    { region: "Oceania", country: "French Polynesia", city: "Papeete", name: "Papeete Tahiti Temple", status: "🟢 Operating", lat: -17.5516, lng: -149.5585, slug: "papeete-tahiti-temple" },
  
    /* ===== GUAM ===== */
    { region: "Oceania", country: "Guam", city: "Barrigada", name: "Yigo Guam Temple", status: "🟢 Operating", lat: 13.5171, lng: 144.8390, slug: "yigo-guam-temple" },
  
    /* ===== MICRONESIA ===== */
    { region: "Oceania", country: "Micronesia", city: "Pohnpei", name: "Pohnpei Micronesia Temple", status: "🔵 Announced", lat: 6.8498, lng: 158.2624, slug: "pohnpei-micronesia-temple" },
  
    /* ===== SOLOMON ISLANDS ===== */
    { region: "Oceania", country: "Solomon Islands", city: "Honiara", name: "Honiara Solomon Islands Temple", status: "🟡 Under Construction", lat: -9.4280, lng: 159.9490, slug: "honiara-solomon-islands-temple" },
  
    /* ===== KIRIBATI ===== */
    { region: "Oceania", country: "Kiribati", city: "Tarawa", name: "Tarawa Kiribati Temple", status: "🟡 Under Construction", lat: 1.4518, lng: 173.0327, slug: "tarawa-kiribati-temple" }
  
  ];

  (function appendOceaniaTemples(){
    if (!window.all_temple_data) window.all_temple_data = [];
    if (Array.isArray(window.temple_data_oceania)) {
      window.all_temple_data = window.all_temple_data.concat(window.temple_data_oceania);
    }
    console.log(`✅ Loaded ${window.temple_data_oceania.length} Oceania temples`);
  })();
  
  /* =====================================================
     EXPORT SUPPORT (for combination in temples.js)
     ===================================================== */
  if (typeof module !== "undefined") {
    module.exports = window.temple_data_oceania;
  }