/* =====================================================
   TEMPLE DATA — AFRICA
   Includes: Ghana, Nigeria, South Africa, Kenya, DR Congo,
   Ivory Coast, Madagascar, Mozambique, Angola, Liberia, etc.
   ===================================================== */

   window.temple_data_africa = [

    /* ===== GHANA ===== */
    { region: "Africa", country: "Ghana", city: "Accra", name: "Accra Ghana Temple", status: "🟢 Operating", lat: 5.5560, lng: -0.1969, slug: "accra-ghana-temple" },
    { region: "Africa", country: "Ghana", city: "Kumasi", name: "Kumasi Ghana Temple", status: "🟡 Under Construction", lat: 6.6900, lng: -1.6300, slug: "kumasi-ghana-temple" },
    { region: "Africa", country: "Ghana", city: "Cape Coast", name: "Cape Coast Ghana Temple", status: "🔵 Announced", lat: 5.1053, lng: -1.2466, slug: "cape-coast-ghana-temple" },
  
    /* ===== NIGERIA ===== */
    { region: "Africa", country: "Nigeria", city: "Abuja", name: "Abuja Nigeria Temple", status: "🟡 Under Construction", lat: 9.0579, lng: 7.4951, slug: "abuja-nigeria-temple" },
    { region: "Africa", country: "Nigeria", city: "Benin City", name: "Benin City Nigeria Temple", status: "🔵 Announced", lat: 6.3350, lng: 5.6037, slug: "benin-city-nigeria-temple" },
    { region: "Africa", country: "Nigeria", city: "Lagos", name: "Lagos Nigeria Temple", status: "🔵 Announced", lat: 6.5244, lng: 3.3792, slug: "lagos-nigeria-temple" },
  
    /* ===== SOUTH AFRICA ===== */
    { region: "Africa", country: "South Africa", city: "Johannesburg", name: "Johannesburg South Africa Temple", status: "🟢 Operating", lat: -26.2041, lng: 28.0473, slug: "johannesburg-south-africa-temple" },
    { region: "Africa", country: "South Africa", city: "Durban", name: "Durban South Africa Temple", status: "🟢 Operating", lat: -29.8587, lng: 31.0218, slug: "durban-south-africa-temple" },
    { region: "Africa", country: "South Africa", city: "Port Elizabeth", name: "Port Elizabeth South Africa Temple", status: "🔵 Announced", lat: -33.9608, lng: 25.6022, slug: "port-elizabeth-south-africa-temple" },
  
    /* ===== KENYA ===== */
    { region: "Africa", country: "Kenya", city: "Nairobi", name: "Nairobi Kenya Temple", status: "🟡 Under Construction", lat: -1.2921, lng: 36.8219, slug: "nairobi-kenya-temple" },
  
    /* ===== DEMOCRATIC REPUBLIC OF CONGO ===== */
    { region: "Africa", country: "Democratic Republic of the Congo", city: "Kinshasa", name: "Kinshasa DR Congo Temple", status: "🟢 Operating", lat: -4.4419, lng: 15.2663, slug: "kinshasa-dr-congo-temple" },
    { region: "Africa", country: "Democratic Republic of the Congo", city: "Kananga", name: "Kananga DR Congo Temple", status: "🟡 Under Construction", lat: -5.8962, lng: 22.4172, slug: "kananga-dr-congo-temple" },
    { region: "Africa", country: "Democratic Republic of the Congo", city: "Mbuji-Mayi", name: "Mbuji-Mayi DR Congo Temple", status: "🔵 Announced", lat: -6.1210, lng: 23.5898, slug: "mbuji-mayi-dr-congo-temple" },
    { region: "Africa", country: "Democratic Republic of the Congo", city: "Lubumbashi", name: "Lubumbashi DR Congo Temple", status: "🔵 Announced", lat: -11.6876, lng: 27.5026, slug: "lubumbashi-dr-congo-temple" },
  
    /* ===== IVORY COAST ===== */
    { region: "Africa", country: "Ivory Coast", city: "Abidjan", name: "Abidjan Ivory Coast Temple", status: "🟢 Operating", lat: 5.3453, lng: -4.0244, slug: "abidjan-ivory-coast-temple" },
    { region: "Africa", country: "Ivory Coast", city: "Yamoussoukro", name: "Yamoussoukro Ivory Coast Temple", status: "🔵 Announced", lat: 6.8206, lng: -5.2767, slug: "yamoussoukro-ivory-coast-temple" },
  
    /* ===== MADAGASCAR ===== */
    { region: "Africa", country: "Madagascar", city: "Antananarivo", name: "Antananarivo Madagascar Temple", status: "🟡 Under Construction", lat: -18.8792, lng: 47.5079, slug: "antananarivo-madagascar-temple" },
  
    /* ===== MOZAMBIQUE ===== */
    { region: "Africa", country: "Mozambique", city: "Maputo", name: "Maputo Mozambique Temple", status: "🟡 Under Construction", lat: -25.9653, lng: 32.5892, slug: "maputo-mozambique-temple" },
  
    /* ===== ANGOLA ===== */
    { region: "Africa", country: "Angola", city: "Luanda", name: "Luanda Angola Temple", status: "🟡 Under Construction", lat: -8.8390, lng: 13.2894, slug: "luanda-angola-temple" },
  
    /* ===== LIBERIA ===== */
    { region: "Africa", country: "Liberia", city: "Monrovia", name: "Monrovia Liberia Temple", status: "🟡 Under Construction", lat: 6.3156, lng: -10.8074, slug: "monrovia-liberia-temple" },
  
    /* ===== SIERRA LEONE ===== */
    { region: "Africa", country: "Sierra Leone", city: "Freetown", name: "Freetown Sierra Leone Temple", status: "🟡 Under Construction", lat: 8.4657, lng: -13.2317, slug: "freetown-sierra-leone-temple" },
  
    /* ===== ZAMBIA ===== */
    { region: "Africa", country: "Zambia", city: "Lusaka", name: "Lusaka Zambia Temple", status: "🟢 Operating", lat: -15.3875, lng: 28.3228, slug: "lusaka-zambia-temple" },
  
    /* ===== ZIMBABWE ===== */
    { region: "Africa", country: "Zimbabwe", city: "Harare", name: "Harare Zimbabwe Temple", status: "🟡 Under Construction", lat: -17.8252, lng: 31.0335, slug: "harare-zimbabwe-temple" },
  
    /* ===== TANZANIA ===== */
    { region: "Africa", country: "Tanzania", city: "Dar es Salaam", name: "Dar es Salaam Tanzania Temple", status: "🔵 Announced", lat: -6.7924, lng: 39.2083, slug: "dar-es-salaam-tanzania-temple" }
  
  ];
  (function appendAfricaTemples(){
    if (!window.all_temple_data) window.all_temple_data = [];
    if (Array.isArray(TEMPLE_DATA_AFRICA)) {
      window.all_temple_data = window.all_temple_data.concat(TEMPLE_DATA_AFRICA);
    }
    console.log(`✅ Loaded ${TEMPLE_DATA_AFRICA.length} African temples`);
  })();