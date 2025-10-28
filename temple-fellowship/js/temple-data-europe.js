/* =====================================================
   TEMPLE DATA — EUROPE
   Includes: United Kingdom, Germany, France, Italy,
   Spain, Portugal, Switzerland, Scandinavia, and Eastern Europe
   ===================================================== */

   window. temple_data_europe = [

    /* ===== UNITED KINGDOM ===== */
    { region: "Europe", country: "United Kingdom", city: "London", name: "London England Temple", status: "🟢 Operating", lat: 51.3781, lng: -0.0575, slug: "london-england-temple" },
    { region: "Europe", country: "United Kingdom", city: "Preston", name: "Preston England Temple", status: "🟢 Operating", lat: 53.6896, lng: -2.6892, slug: "preston-england-temple" },
    { region: "Europe", country: "United Kingdom", city: "Birmingham", name: "Birmingham England Temple", status: "🔵 Announced", lat: 52.4862, lng: -1.8904, slug: "birmingham-england-temple" },
  
    /* ===== GERMANY ===== */
    { region: "Europe", country: "Germany", city: "Frankfurt", name: "Frankfurt Germany Temple", status: "🟢 Operating", lat: 50.1109, lng: 8.6821, slug: "frankfurt-germany-temple" },
    { region: "Europe", country: "Germany", city: "Freiberg", name: "Freiberg Germany Temple", status: "🟢 Operating", lat: 50.9167, lng: 13.3333, slug: "freiberg-germany-temple" },
    { region: "Europe", country: "Germany", city: "Hamburg", name: "Hamburg Germany Temple", status: "🔵 Announced", lat: 53.5511, lng: 9.9937, slug: "hamburg-germany-temple" },
  
    /* ===== FRANCE ===== */
    { region: "Europe", country: "France", city: "Paris", name: "Paris France Temple", status: "🟢 Operating", lat: 48.8566, lng: 2.3522, slug: "paris-france-temple" },
  
    /* ===== ITALY ===== */
    { region: "Europe", country: "Italy", city: "Rome", name: "Rome Italy Temple", status: "🟢 Operating", lat: 41.9028, lng: 12.4964, slug: "rome-italy-temple" },
  
    /* ===== SPAIN ===== */
    { region: "Europe", country: "Spain", city: "Madrid", name: "Madrid Spain Temple", status: "🟢 Operating", lat: 40.4168, lng: -3.7038, slug: "madrid-spain-temple" },
    { region: "Europe", country: "Spain", city: "Barcelona", name: "Barcelona Spain Temple", status: "🔵 Announced", lat: 41.3851, lng: 2.1734, slug: "barcelona-spain-temple" },
  
    /* ===== PORTUGAL ===== */
    { region: "Europe", country: "Portugal", city: "Lisbon", name: "Lisbon Portugal Temple", status: "🟢 Operating", lat: 38.7169, lng: -9.1399, slug: "lisbon-portugal-temple" },
  
    /* ===== SWITZERLAND ===== */
    { region: "Europe", country: "Switzerland", city: "Zollikofen", name: "Bern Switzerland Temple", status: "🟢 Operating", lat: 46.9544, lng: 7.4547, slug: "bern-switzerland-temple" },
  
    /* ===== NETHERLANDS ===== */
    { region: "Europe", country: "Netherlands", city: "Zoetermeer", name: "The Hague Netherlands Temple", status: "🟢 Operating", lat: 52.0607, lng: 4.4945, slug: "the-hague-netherlands-temple" },
  
    /* ===== DENMARK ===== */
    { region: "Europe", country: "Denmark", city: "Copenhagen", name: "Copenhagen Denmark Temple", status: "🟢 Operating", lat: 55.6761, lng: 12.5683, slug: "copenhagen-denmark-temple" },
  
    /* ===== SWEDEN ===== */
    { region: "Europe", country: "Sweden", city: "Stockholm", name: "Stockholm Sweden Temple", status: "🟢 Operating", lat: 59.3293, lng: 18.0686, slug: "stockholm-sweden-temple" },
  
    /* ===== FINLAND ===== */
    { region: "Europe", country: "Finland", city: "Espoo", name: "Helsinki Finland Temple", status: "🟢 Operating", lat: 60.2055, lng: 24.6559, slug: "helsinki-finland-temple" },
  
    /* ===== NORWAY ===== */
    { region: "Europe", country: "Norway", city: "Oslo", name: "Oslo Norway Temple", status: "🟡 Under Construction", lat: 59.9139, lng: 10.7522, slug: "oslo-norway-temple" },
  
    /* ===== AUSTRIA ===== */
    { region: "Europe", country: "Austria", city: "Vienna", name: "Vienna Austria Temple", status: "🟡 Under Construction", lat: 48.2082, lng: 16.3738, slug: "vienna-austria-temple" },
  
    /* ===== POLAND ===== */
    { region: "Europe", country: "Poland", city: "Warsaw", name: "Warsaw Poland Temple", status: "🟡 Under Construction", lat: 52.2297, lng: 21.0122, slug: "warsaw-poland-temple" },
  
    /* ===== CZECH REPUBLIC ===== */
    { region: "Europe", country: "Czech Republic", city: "Prague", name: "Prague Czech Republic Temple", status: "🔵 Announced", lat: 50.0755, lng: 14.4378, slug: "prague-czech-republic-temple" },
  
    /* ===== HUNGARY ===== */
    { region: "Europe", country: "Hungary", city: "Budapest", name: "Budapest Hungary Temple", status: "🟡 Under Construction", lat: 47.4979, lng: 19.0402, slug: "budapest-hungary-temple" },
  
    /* ===== ROMANIA ===== */
    { region: "Europe", country: "Romania", city: "Bucharest", name: "Bucharest Romania Temple", status: "🟡 Under Construction", lat: 44.4268, lng: 26.1025, slug: "bucharest-romania-temple" },
  
    /* ===== CROATIA ===== */
    { region: "Europe", country: "Croatia", city: "Zagreb", name: "Zagreb Croatia Temple", status: "🔵 Announced", lat: 45.8150, lng: 15.9819, slug: "zagreb-croatia-temple" },
  
    /* ===== RUSSIA ===== */
    { region: "Europe", country: "Russia", city: "Moscow", name: "Moscow Russia Temple", status: "🔵 Announced", lat: 55.7558, lng: 37.6173, slug: "moscow-russia-temple" }
  
  ];
  
  /* =====================================================
     EXPORT SUPPORT (for combination in temples.js)
     ===================================================== */
  if (typeof module !== "undefined") {
    module.exports = TEMPLE_DATA_EUROPE;
  }