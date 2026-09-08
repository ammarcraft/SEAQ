/**
 * GLOBAL PORTS DATABASE (EXPANDED MARITIME NETWORK)
 * Covers major container, bulk, tanker, and transshipment hubs worldwide.
 * Supports intelligent multi-port country search (e.g. typing 'India', 'China', 'USA', 'UAE').
 */

export const GLOBAL_PORTS = [
  // ==========================================
  // INDIA 🇮🇳 (Major Commercial & Deepwater Ports)
  // ==========================================
  {
    id: 'INBOM',
    name: 'Mumbai (JNPT - Nhava Sheva)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Hindustan', 'Nhava Sheva', 'Maharashtra', 'Bombay'],
    portType: 'Container Mega Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [72.95, 18.95],
  },
  {
    id: 'INMUN',
    name: 'Mundra Port (Adani Gujarat)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Hindustan', 'Gujarat', 'Kutch', 'Adani'],
    portType: 'Deepwater Private Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [69.70, 22.74],
  },
  {
    id: 'INMAA',
    name: 'Chennai Port (Madras Harbor)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Tamil Nadu', 'Madras', 'Coromandel'],
    portType: 'Automotive & Container Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [80.30, 13.08],
  },
  {
    id: 'INCOK',
    name: 'Cochin Port (Vallarpadam ICTT)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Kerala', 'Kochi', 'Vallarpadam'],
    portType: 'Direct Sea Transshipment Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [76.26, 9.96],
  },
  {
    id: 'INVTZ',
    name: 'Visakhapatnam Port (Vizag)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Andhra Pradesh', 'Vizag', 'East Coast'],
    portType: 'Deepwater Bulk & Container',
    continent: 'Asia',
    isEurope: false,
    coords: [83.30, 17.69],
  },
  {
    id: 'INIXY',
    name: 'Kandla / Deendayal Port',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Gujarat', 'Gandhidham', 'Deendayal'],
    portType: 'Major Liquid Petro & Dry Bulk Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [70.22, 23.01],
  },
  {
    id: 'INCCU',
    name: 'Kolkata / Haldia Dock Complex',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'West Bengal', 'Calcutta', 'Haldia', 'Hooghly'],
    portType: 'Riverine Industrial Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [88.06, 22.02],
  },
  {
    id: 'INTUT',
    name: 'Tuticorin (V.O. Chidambaranar Port)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Tamil Nadu', 'VOC Port', 'Thoothukudi'],
    portType: 'All-Weather Coastal Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [78.18, 8.75],
  },
  {
    id: 'INNML',
    name: 'New Mangalore Port (Panambur)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Karnataka', 'Mangalore', 'Panambur'],
    portType: 'Petrochemical & LPG Terminal',
    continent: 'Asia',
    isEurope: false,
    coords: [74.82, 12.92],
  },
  {
    id: 'INMRM',
    name: 'Mormugao Port (Goa)',
    country: 'India',
    flag: '🇮🇳',
    countryCode: 'IN',
    aliases: ['India', 'Bharat', 'Goa', 'Vasco da Gama'],
    portType: 'Natural Deepwater Harbor',
    continent: 'Asia',
    isEurope: false,
    coords: [73.80, 15.41],
  },

  // ==========================================
  // CHINA 🇨🇳 (Major Oceanic Corridors)
  // ==========================================
  {
    id: 'CNSHA',
    name: 'Shanghai (Yangshan Deepwater)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Yangshan', 'Shanghai', 'East Asia'],
    portType: 'World #1 Mega Container Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [122.06, 30.62],
  },
  {
    id: 'CNNGB',
    name: 'Ningbo-Zhoushan Port',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Zhejiang', 'Zhoushan', 'Ningbo'],
    portType: 'World Highest Tonnage Port',
    continent: 'Asia',
    isEurope: false,
    coords: [121.85, 29.89],
  },
  {
    id: 'CNSZX',
    name: 'Shenzhen (Yantian & Shekou)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Guangdong', 'Yantian', 'Shekou'],
    portType: 'Global Tech & Container Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [114.28, 22.57],
  },
  {
    id: 'CNGZG',
    name: 'Guangzhou (Nansha Deepwater)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Canton', 'Nansha', 'Pearl River'],
    portType: 'South China Trade Core',
    continent: 'Asia',
    isEurope: false,
    coords: [113.62, 22.77],
  },
  {
    id: 'CNTAO',
    name: 'Qingdao Port (Shandong Peninsula)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Shandong', 'Yellow Sea'],
    portType: 'Automated Iron Ore & Crude Terminal',
    continent: 'Asia',
    isEurope: false,
    coords: [120.32, 36.08],
  },
  {
    id: 'CNTSN',
    name: 'Tianjin Port (Bohai Bay Gateway)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Beijing Gateway', 'Bohai'],
    portType: 'Northern China Maritime Door',
    continent: 'Asia',
    isEurope: false,
    coords: [117.72, 38.98],
  },
  {
    id: 'CNXMN',
    name: 'Xiamen Port (Haicang)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Fujian', 'Taiwan Strait'],
    portType: 'Strait Cross-Trading Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [118.06, 24.47],
  },
  {
    id: 'CNDLC',
    name: 'Dalian Port (Liaoning)',
    country: 'China',
    flag: '🇨🇳',
    countryCode: 'CN',
    aliases: ['China', 'PRC', 'Liaoning', 'Bohai Rim'],
    portType: 'Northeast Asia Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [121.65, 38.92],
  },
  {
    id: 'HKHKG',
    name: 'Hong Kong (Victoria Harbor - Kwai Chung)',
    country: 'China',
    flag: '🇭🇰',
    countryCode: 'HK',
    aliases: ['Hong Kong', 'China', 'Kwai Chung', 'HK'],
    portType: 'Premier Transshipment Free Port',
    continent: 'Asia',
    isEurope: false,
    coords: [114.13, 22.30],
  },

  // ==========================================
  // UNITED STATES 🇺🇸
  // ==========================================
  {
    id: 'USLAX',
    name: 'Los Angeles (San Pedro Bay)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'California', 'LA', 'San Pedro'],
    portType: 'Americas #1 Container Gateway',
    continent: 'North America',
    isEurope: false,
    coords: [-118.25, 33.72],
  },
  {
    id: 'USLGB',
    name: 'Long Beach Harbor',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'California', 'Long Beach'],
    portType: 'Green Pacific Container Hub',
    continent: 'North America',
    isEurope: false,
    coords: [-118.21, 33.75],
  },
  {
    id: 'USNYC',
    name: 'New York & New Jersey (Newark Terminal)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'New York', 'Newark', 'East Coast'],
    portType: 'East Coast Super-Hub',
    continent: 'North America',
    isEurope: false,
    coords: [-74.05, 40.65],
  },
  {
    id: 'USHOU',
    name: 'Houston Port (Texas Gulf Channel)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'Texas', 'Gulf of Mexico'],
    portType: 'Energy & Petrochemical Mega Complex',
    continent: 'North America',
    isEurope: false,
    coords: [-95.27, 29.74],
  },
  {
    id: 'USSAV',
    name: 'Savannah Port (Garden City, Georgia)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'Georgia', 'Savannah'],
    portType: 'Single-Terminal Rail-Connected Gateway',
    continent: 'North America',
    isEurope: false,
    coords: [-81.14, 32.13],
  },
  {
    id: 'USSEA',
    name: 'Seattle / Tacoma (Northwest Alliance)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'Washington', 'Puget Sound'],
    portType: 'Pacific Northwest Container Gateway',
    continent: 'North America',
    isEurope: false,
    coords: [-122.35, 47.60],
  },
  {
    id: 'USORF',
    name: 'Norfolk (Virginia International Gateway)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'Virginia', 'Hampton Roads'],
    portType: '55-Foot Deepwater Channel Port',
    continent: 'North America',
    isEurope: false,
    coords: [-76.32, 36.95],
  },
  {
    id: 'USOAK',
    name: 'Oakland Port (San Francisco Bay)',
    country: 'United States',
    flag: '🇺🇸',
    countryCode: 'US',
    aliases: ['USA', 'US', 'America', 'California', 'San Francisco Bay'],
    portType: 'Agri-Export & Container Port',
    continent: 'North America',
    isEurope: false,
    coords: [-122.31, 37.80],
  },

  // ==========================================
  // UNITED ARAB EMIRATES (UAE) 🇦🇪
  // ==========================================
  {
    id: 'AEDXB',
    name: 'Dubai (Jebel Ali Port)',
    country: 'UAE',
    flag: '🇦🇪',
    countryCode: 'AE',
    aliases: ['UAE', 'United Arab Emirates', 'Emirates', 'Dubai', 'Jebel Ali'],
    portType: 'Middle East #1 Mega Hub',
    continent: 'Middle East',
    isEurope: false,
    coords: [55.02, 25.05],
  },
  {
    id: 'AEKHL',
    name: 'Abu Dhabi (Khalifa Port)',
    country: 'UAE',
    flag: '🇦🇪',
    countryCode: 'AE',
    aliases: ['UAE', 'United Arab Emirates', 'Emirates', 'Abu Dhabi', 'Taweelah'],
    portType: 'Automated Deepwater Quay',
    continent: 'Middle East',
    isEurope: false,
    coords: [54.65, 24.78],
  },
  {
    id: 'AEFJR',
    name: 'Fujairah Port (Gulf of Oman)',
    country: 'UAE',
    flag: '🇦🇪',
    countryCode: 'AE',
    aliases: ['UAE', 'United Arab Emirates', 'Emirates', 'Fujairah', 'Bunkering'],
    portType: 'Global Bunker & Crude Storage Hub',
    continent: 'Middle East',
    isEurope: false,
    coords: [56.36, 25.17],
  },
  {
    id: 'AEKLF',
    name: 'Khor Fakkan Container Terminal (Sharjah)',
    country: 'UAE',
    flag: '🇦🇪',
    countryCode: 'AE',
    aliases: ['UAE', 'United Arab Emirates', 'Sharjah', 'Khor Fakkan'],
    portType: 'Outside Strait of Hormuz Transshipment',
    continent: 'Middle East',
    isEurope: false,
    coords: [56.36, 25.36],
  },

  // ==========================================
  // SINGAPORE 🇸🇬
  // ==========================================
  {
    id: 'SGTUA',
    name: 'Singapore (Tuas Mega Port)',
    country: 'Singapore',
    flag: '🇸🇬',
    countryCode: 'SG',
    aliases: ['Singapore', 'SG', 'Tuas', 'Strait of Malacca'],
    portType: '65 Million TEU Automated Mega Terminal',
    continent: 'Asia',
    isEurope: false,
    coords: [103.63, 1.28],
  },
  {
    id: 'SGPSP',
    name: 'Singapore (Pasir Panjang Terminal)',
    country: 'Singapore',
    flag: '🇸🇬',
    countryCode: 'SG',
    aliases: ['Singapore', 'SG', 'Pasir Panjang', 'PSA'],
    portType: 'Ultra-Deep Draught Container Terminal',
    continent: 'Asia',
    isEurope: false,
    coords: [103.78, 1.28],
  },
  {
    id: 'SGKEP',
    name: 'Singapore (East Anchorage & Keppel)',
    country: 'Singapore',
    flag: '🇸🇬',
    countryCode: 'SG',
    aliases: ['Singapore', 'SG', 'Keppel', 'East Anchorage'],
    portType: 'Global Transshipment Crossroad',
    continent: 'Asia',
    isEurope: false,
    coords: [103.85, 1.25],
  },

  // ==========================================
  // NETHERLANDS 🇳🇱 (EUROPE)
  // ==========================================
  {
    id: 'NLRTM',
    name: 'Rotterdam (Maasvlakte 2 Gateway)',
    country: 'Netherlands',
    flag: '🇳🇱',
    countryCode: 'NL',
    aliases: ['Netherlands', 'Holland', 'Rotterdam', 'Maasvlakte', 'Europe'],
    portType: 'Europe #1 Deepwater Mega Port',
    continent: 'Europe',
    isEurope: true,
    coords: [3.98, 51.99],
  },
  {
    id: 'NLAMS',
    name: 'Amsterdam Port (North Sea Canal)',
    country: 'Netherlands',
    flag: '🇳🇱',
    countryCode: 'NL',
    aliases: ['Netherlands', 'Holland', 'Amsterdam', 'Europe'],
    portType: 'Energy, Cocoa & Biofuel Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [4.80, 52.40],
  },
  {
    id: 'NLVLI',
    name: 'Vlissingen / North Sea Port',
    country: 'Netherlands',
    flag: '🇳🇱',
    countryCode: 'NL',
    aliases: ['Netherlands', 'Holland', 'Vlissingen', 'Flushing'],
    portType: 'Scheldt Estuary Deepwater Basin',
    continent: 'Europe',
    isEurope: true,
    coords: [3.60, 51.45],
  },

  // ==========================================
  // GERMANY 🇩🇪 (EUROPE)
  // ==========================================
  {
    id: 'DEHAM',
    name: 'Hamburg (Elbe River Gateway)',
    country: 'Germany',
    flag: '🇩🇪',
    countryCode: 'DE',
    aliases: ['Germany', 'Deutschland', 'Hamburg', 'Elbe', 'Europe'],
    portType: 'Germany Premier Rail-Port Gateway',
    continent: 'Europe',
    isEurope: true,
    coords: [9.95, 53.53],
  },
  {
    id: 'DEBRV',
    name: 'Bremerhaven (Wilhelm Kaisen Quay)',
    country: 'Germany',
    flag: '🇩🇪',
    countryCode: 'DE',
    aliases: ['Germany', 'Deutschland', 'Bremen', 'Bremerhaven'],
    portType: 'Global Automotive & 5km Container Quay',
    continent: 'Europe',
    isEurope: true,
    coords: [8.55, 53.56],
  },
  {
    id: 'DEWVN',
    name: 'Wilhelmshaven (JadeWeserPort)',
    country: 'Germany',
    flag: '🇩🇪',
    countryCode: 'DE',
    aliases: ['Germany', 'Deutschland', 'JadeWeserPort'],
    portType: 'Tide-Free 18m Deepwater Container Port',
    continent: 'Europe',
    isEurope: true,
    coords: [8.14, 53.59],
  },

  // ==========================================
  // UNITED KINGDOM 🇬🇧
  // ==========================================
  {
    id: 'GBFXT',
    name: 'Felixstowe Port (Suffolk)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    countryCode: 'GB',
    aliases: ['UK', 'United Kingdom', 'Britain', 'England', 'Felixstowe'],
    portType: 'Britain Largest Container Port',
    continent: 'Europe',
    isEurope: true,
    coords: [1.31, 51.95],
  },
  {
    id: 'GBSOU',
    name: 'Southampton Port (Solent Deepwater)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    countryCode: 'GB',
    aliases: ['UK', 'United Kingdom', 'Britain', 'England', 'Southampton'],
    portType: 'Double-Tide Automotive & Container Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [-1.40, 50.90],
  },
  {
    id: 'GBLGP',
    name: 'London Gateway (Thames Estuary)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    countryCode: 'GB',
    aliases: ['UK', 'United Kingdom', 'Britain', 'London', 'Thames'],
    portType: 'Automated Deep-Sea Logistics Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [0.47, 51.51],
  },
  {
    id: 'GBLIV',
    name: 'Liverpool Port (Royal Seaforth)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    countryCode: 'GB',
    aliases: ['UK', 'United Kingdom', 'Britain', 'Liverpool', 'Mersey'],
    portType: 'Transatlantic & Irish Sea Gateway',
    continent: 'Europe',
    isEurope: true,
    coords: [-3.02, 53.45],
  },

  // ==========================================
  // JAPAN 🇯🇵
  // ==========================================
  {
    id: 'JPYOK',
    name: 'Yokohama / Tokyo Bay Harbor',
    country: 'Japan',
    flag: '🇯🇵',
    countryCode: 'JP',
    aliases: ['Japan', 'Nippon', 'Tokyo', 'Yokohama', 'Kanto'],
    portType: 'Premier Pacific Trade Complex',
    continent: 'Asia',
    isEurope: false,
    coords: [139.68, 35.44],
  },
  {
    id: 'JPUKB',
    name: 'Kobe Port (Hanshin Gateway)',
    country: 'Japan',
    flag: '🇯🇵',
    countryCode: 'JP',
    aliases: ['Japan', 'Nippon', 'Kobe', 'Kansai'],
    portType: 'Natural Deepwater Industrial Port',
    continent: 'Asia',
    isEurope: false,
    coords: [135.23, 34.67],
  },
  {
    id: 'JPNGO',
    name: 'Nagoya Port (Ise Bay)',
    country: 'Japan',
    flag: '🇯🇵',
    countryCode: 'JP',
    aliases: ['Japan', 'Nippon', 'Nagoya', 'Toyota Hub'],
    portType: 'Highest Cargo Value Japanese Port',
    continent: 'Asia',
    isEurope: false,
    coords: [136.88, 35.08],
  },
  {
    id: 'JPOSA',
    name: 'Osaka Port (Nanko Basin)',
    country: 'Japan',
    flag: '🇯🇵',
    countryCode: 'JP',
    aliases: ['Japan', 'Nippon', 'Osaka', 'Kansai'],
    portType: 'Western Japan Trade Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [135.43, 34.65],
  },

  // ==========================================
  // SOUTH KOREA 🇰🇷
  // ==========================================
  {
    id: 'KRPUS',
    name: 'Busan Harbor (New Port & North Port)',
    country: 'South Korea',
    flag: '🇰🇷',
    countryCode: 'KR',
    aliases: ['South Korea', 'Korea', 'ROK', 'Busan', 'Pusan'],
    portType: 'Global Transshipment Super-Hub #2',
    continent: 'Asia',
    isEurope: false,
    coords: [128.83, 35.08],
  },
  {
    id: 'KRINC',
    name: 'Incheon Port (Yellow Sea Hub)',
    country: 'South Korea',
    flag: '🇰🇷',
    countryCode: 'KR',
    aliases: ['South Korea', 'Korea', 'Incheon', 'Seoul Gateway'],
    portType: 'Capital Metropolitan Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [126.61, 37.45],
  },
  {
    id: 'KRKAN',
    name: 'Gwangyang Port (Suncheon Bay)',
    country: 'South Korea',
    flag: '🇰🇷',
    countryCode: 'KR',
    aliases: ['South Korea', 'Korea', 'Gwangyang'],
    portType: 'POSCO Steel & Petrochemical Complex',
    continent: 'Asia',
    isEurope: false,
    coords: [127.72, 34.91],
  },

  // ==========================================
  // SAUDI ARABIA 🇸🇦
  // ==========================================
  {
    id: 'SAJED',
    name: 'Jeddah Islamic Port (Red Sea Gateway)',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    countryCode: 'SA',
    aliases: ['Saudi Arabia', 'KSA', 'Jeddah', 'Red Sea'],
    portType: 'Red Sea Premier Commercial Gateway',
    continent: 'Middle East',
    isEurope: false,
    coords: [39.16, 21.48],
  },
  {
    id: 'SAKAP',
    name: 'King Abdullah Port (Rabigh)',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    countryCode: 'SA',
    aliases: ['Saudi Arabia', 'KSA', 'King Abdullah', 'Rabigh'],
    portType: '18m Deepwater Automated Hub',
    continent: 'Middle East',
    isEurope: false,
    coords: [39.12, 22.54],
  },
  {
    id: 'SADMM',
    name: 'Dammam (King Abdulaziz Port - Gulf)',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    countryCode: 'SA',
    aliases: ['Saudi Arabia', 'KSA', 'Dammam', 'Persian Gulf'],
    portType: 'Arabian Gulf Industrial Gateway',
    continent: 'Middle East',
    isEurope: false,
    coords: [50.18, 26.49],
  },

  // ==========================================
  // EGYPT 🇪🇬
  // ==========================================
  {
    id: 'EGPSD',
    name: 'Port Said (Suez Canal North Entrance)',
    country: 'Egypt',
    flag: '🇪🇬',
    countryCode: 'EG',
    aliases: ['Egypt', 'Port Said', 'Suez Canal', 'Mediterranean'],
    portType: 'Canal Transit Transshipment Hub',
    continent: 'Africa',
    isEurope: false,
    coords: [32.32, 31.26],
  },
  {
    id: 'EGSUZ',
    name: 'Suez Port (Suez Canal South Entrance)',
    country: 'Egypt',
    flag: '🇪🇬',
    countryCode: 'EG',
    aliases: ['Egypt', 'Suez', 'Red Sea Canal'],
    portType: 'Red Sea Gateway & Transit Anchor',
    continent: 'Africa',
    isEurope: false,
    coords: [32.55, 29.96],
  },
  {
    id: 'EGALY',
    name: 'Alexandria & El Dekheila Port',
    country: 'Egypt',
    flag: '🇪🇬',
    countryCode: 'EG',
    aliases: ['Egypt', 'Alexandria', 'Dekheila'],
    portType: '60% of Egypt Foreign Maritime Trade',
    continent: 'Africa',
    isEurope: false,
    coords: [29.85, 31.18],
  },

  // ==========================================
  // SPAIN 🇪🇸 (EUROPE)
  // ==========================================
  {
    id: 'ESVLC',
    name: 'Valencia Terminal (Western Med #1)',
    country: 'Spain',
    flag: '🇪🇸',
    countryCode: 'ES',
    aliases: ['Spain', 'Espana', 'Valencia', 'Europe'],
    portType: 'Western Mediterranean Container Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [-0.30, 39.44],
  },
  {
    id: 'ESALG',
    name: 'Algeciras (Strait of Gibraltar)',
    country: 'Spain',
    flag: '🇪🇸',
    countryCode: 'ES',
    aliases: ['Spain', 'Espana', 'Algeciras', 'Gibraltar', 'Europe'],
    portType: 'Global Transshipment Strait Chokepoint',
    continent: 'Europe',
    isEurope: true,
    coords: [-5.44, 36.14],
  },
  {
    id: 'ESBCN',
    name: 'Barcelona Port (Catalonia Gateway)',
    country: 'Spain',
    flag: '🇪🇸',
    countryCode: 'ES',
    aliases: ['Spain', 'Espana', 'Barcelona', 'Catalunya', 'Europe'],
    portType: 'Mediterranean Multimodal Logistics Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [2.16, 41.35],
  },
  {
    id: 'ESLPA',
    name: 'Las Palmas (Canary Islands - Atlantic)',
    country: 'Spain',
    flag: '🇪🇸',
    countryCode: 'ES',
    aliases: ['Spain', 'Espana', 'Canary Islands', 'Las Palmas'],
    portType: 'Mid-Atlantic Bunker & Route Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [-15.42, 28.14],
  },

  // ==========================================
  // BELGIUM 🇧🇪 (EUROPE)
  // ==========================================
  {
    id: 'BEANR',
    name: 'Antwerp Gateway (Port of Antwerp-Bruges)',
    country: 'Belgium',
    flag: '🇧🇪',
    countryCode: 'BE',
    aliases: ['Belgium', 'Belgique', 'Antwerp', 'Antwerpen', 'Europe'],
    portType: 'Europe #2 Port & Petrochemical Cluster',
    continent: 'Europe',
    isEurope: true,
    coords: [4.28, 51.28],
  },
  {
    id: 'BEZEE',
    name: 'Zeebrugge Coastal Port',
    country: 'Belgium',
    flag: '🇧🇪',
    countryCode: 'BE',
    aliases: ['Belgium', 'Zeebrugge', 'Brugge', 'Europe'],
    portType: 'LNG Gas & Ro-Ro Automotive Terminal',
    continent: 'Europe',
    isEurope: true,
    coords: [3.20, 51.34],
  },

  // ==========================================
  // MALAYSIA 🇲🇾
  // ==========================================
  {
    id: 'MYPKG',
    name: 'Port Klang (Westports & Northport)',
    country: 'Malaysia',
    flag: '🇲🇾',
    countryCode: 'MY',
    aliases: ['Malaysia', 'Klang', 'Kuala Lumpur', 'Westports'],
    portType: 'Strait of Malacca Mega Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [101.35, 3.00],
  },
  {
    id: 'MYTPP',
    name: 'Tanjung Pelepas (PTP Johor)',
    country: 'Malaysia',
    flag: '🇲🇾',
    countryCode: 'MY',
    aliases: ['Malaysia', 'Johor', 'PTP', 'Tanjung Pelepas'],
    portType: 'Global Deep-Sea Transshipment Hub',
    continent: 'Asia',
    isEurope: false,
    coords: [103.54, 1.36],
  },
  {
    id: 'MYPEN',
    name: 'Penang Port (North Malacca)',
    country: 'Malaysia',
    flag: '🇲🇾',
    countryCode: 'MY',
    aliases: ['Malaysia', 'Penang', 'George Town'],
    portType: 'Northern Peninsular Industrial Gateway',
    continent: 'Asia',
    isEurope: false,
    coords: [100.37, 5.41],
  },

  // ==========================================
  // SRI LANKA 🇱🇰
  // ==========================================
  {
    id: 'LKCMB',
    name: 'Colombo Port (CICT & South Terminal)',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    countryCode: 'LK',
    aliases: ['Sri Lanka', 'Ceylon', 'Colombo'],
    portType: 'South Asia Central Transshipment Crossroad',
    continent: 'Asia',
    isEurope: false,
    coords: [79.84, 6.95],
  },
  {
    id: 'LKHRI',
    name: 'Hambantota Port (Mahinda Rajapaksa)',
    country: 'Sri Lanka',
    flag: '🇱🇰',
    countryCode: 'LK',
    aliases: ['Sri Lanka', 'Hambantota', 'Ceylon'],
    portType: 'Deepwater East-West Trunk Sea Lane',
    continent: 'Asia',
    isEurope: false,
    coords: [81.12, 6.12],
  },

  // ==========================================
  // AUSTRALIA 🇦🇺
  // ==========================================
  {
    id: 'AUSYD',
    name: 'Sydney (Port Botany Harbor)',
    country: 'Australia',
    flag: '🇦🇺',
    countryCode: 'AU',
    aliases: ['Australia', 'Sydney', 'Botany Bay', 'NSW'],
    portType: 'New South Wales Container Gateway',
    continent: 'Oceania',
    isEurope: false,
    coords: [151.22, -33.98],
  },
  {
    id: 'AUMEL',
    name: 'Melbourne Port (Swanson Dock)',
    country: 'Australia',
    flag: '🇦🇺',
    countryCode: 'AU',
    aliases: ['Australia', 'Melbourne', 'Victoria'],
    portType: 'Australia #1 Container Cargo Port',
    continent: 'Oceania',
    isEurope: false,
    coords: [144.92, -37.84],
  },
  {
    id: 'AUBNE',
    name: 'Brisbane Port (Fisherman Islands)',
    country: 'Australia',
    flag: '🇦🇺',
    countryCode: 'AU',
    aliases: ['Australia', 'Brisbane', 'Queensland'],
    portType: 'Fast-Growing Multimodal Gateway',
    continent: 'Oceania',
    isEurope: false,
    coords: [153.17, -27.38],
  },
  {
    id: 'AUFRE',
    name: 'Fremantle Port (Perth, WA)',
    country: 'Australia',
    flag: '🇦🇺',
    countryCode: 'AU',
    aliases: ['Australia', 'Fremantle', 'Perth', 'Western Australia'],
    portType: 'Indian Ocean Western Gateway',
    continent: 'Oceania',
    isEurope: false,
    coords: [115.74, -32.05],
  },

  // ==========================================
  // BRAZIL 🇧🇷
  // ==========================================
  {
    id: 'BRSSZ',
    name: 'Santos Port (São Paulo Estuary)',
    country: 'Brazil',
    flag: '🇧🇷',
    countryCode: 'BR',
    aliases: ['Brazil', 'Brasil', 'Santos', 'Sao Paulo'],
    portType: 'Latin America Largest Mega Port',
    continent: 'South America',
    isEurope: false,
    coords: [-46.30, -23.96],
  },
  {
    id: 'BRPNG',
    name: 'Paranaguá Port (Paraná)',
    country: 'Brazil',
    flag: '🇧🇷',
    countryCode: 'BR',
    aliases: ['Brazil', 'Brasil', 'Paranagua', 'Curitiba'],
    portType: 'World Agri-Bulk & Grain Giant',
    continent: 'South America',
    isEurope: false,
    coords: [-48.51, -25.50],
  },
  {
    id: 'BRRIO',
    name: 'Rio de Janeiro Harbor',
    country: 'Brazil',
    flag: '🇧🇷',
    countryCode: 'BR',
    aliases: ['Brazil', 'Brasil', 'Rio de Janeiro', 'Guanabara'],
    portType: 'Offshore Petroleum & Industrial Bay',
    continent: 'South America',
    isEurope: false,
    coords: [-43.18, -22.89],
  },

  // ==========================================
  // SOUTH AFRICA 🇿🇦
  // ==========================================
  {
    id: 'ZADUR',
    name: 'Durban Port (Point & Pier 2)',
    country: 'South Africa',
    flag: '🇿🇦',
    countryCode: 'ZA',
    aliases: ['South Africa', 'Durban', 'KwaZulu-Natal'],
    portType: 'Sub-Saharan Africa #1 Container Hub',
    continent: 'Africa',
    isEurope: false,
    coords: [31.02, -29.87],
  },
  {
    id: 'ZACPT',
    name: 'Cape Town (Table Bay Harbor)',
    country: 'South Africa',
    flag: '🇿🇦',
    countryCode: 'ZA',
    aliases: ['South Africa', 'Cape Town', 'Cape of Good Hope'],
    portType: 'Cape Route Strategic Crossroads',
    continent: 'Africa',
    isEurope: false,
    coords: [18.44, -33.92],
  },
  {
    id: 'ZANGQ',
    name: 'Port of Ngqura (Coega Deepwater)',
    country: 'South Africa',
    flag: '🇿🇦',
    countryCode: 'ZA',
    aliases: ['South Africa', 'Ngqura', 'Coega', 'Port Elizabeth'],
    portType: '16m Deepwater Transshipment Hub',
    continent: 'Africa',
    isEurope: false,
    coords: [25.68, -33.80],
  },

  // ==========================================
  // FRANCE 🇫🇷 (EUROPE)
  // ==========================================
  {
    id: 'FRLEH',
    name: 'Le Havre (HAROPA Port of Paris)',
    country: 'France',
    flag: '🇫🇷',
    countryCode: 'FR',
    aliases: ['France', 'Le Havre', 'Normandy', 'Paris', 'Europe'],
    portType: 'English Channel Container Gateway',
    continent: 'Europe',
    isEurope: true,
    coords: [0.11, 49.48],
  },
  {
    id: 'FRMRS',
    name: 'Marseille-Fos (Grand Port Maritime)',
    country: 'France',
    flag: '🇫🇷',
    countryCode: 'FR',
    aliases: ['France', 'Marseille', 'Fos', 'Mediterranean', 'Europe'],
    portType: 'Southern European Industrial Door',
    continent: 'Europe',
    isEurope: true,
    coords: [4.89, 43.43],
  },

  // ==========================================
  // ITALY 🇮🇹 (EUROPE)
  // ==========================================
  {
    id: 'ITGOA',
    name: 'Genoa Port (Sampierdarena & Voltri)',
    country: 'Italy',
    flag: '🇮🇹',
    countryCode: 'IT',
    aliases: ['Italy', 'Italia', 'Genoa', 'Genova', 'Europe'],
    portType: 'Northern Italy Premier Industrial Gateway',
    continent: 'Europe',
    isEurope: true,
    coords: [8.91, 44.41],
  },
  {
    id: 'ITTRS',
    name: 'Trieste Port (Adriatic Free Port)',
    country: 'Italy',
    flag: '🇮🇹',
    countryCode: 'IT',
    aliases: ['Italy', 'Italia', 'Trieste', 'Adriatic', 'Europe'],
    portType: 'Central Europe Rail-Sea Corridor Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [13.76, 45.65],
  },
  {
    id: 'ITGIT',
    name: 'Gioia Tauro (Calabria Mega Quay)',
    country: 'Italy',
    flag: '🇮🇹',
    countryCode: 'IT',
    aliases: ['Italy', 'Italia', 'Gioia Tauro', 'Calabria', 'Europe'],
    portType: 'Mediterranean Central Transshipment Point',
    continent: 'Europe',
    isEurope: true,
    coords: [15.90, 38.43],
  },

  // ==========================================
  // GREECE 🇬🇷 (EUROPE)
  // ==========================================
  {
    id: 'GRPIR',
    name: 'Piraeus Port (Saronic Gulf)',
    country: 'Greece',
    flag: '🇬🇷',
    countryCode: 'GR',
    aliases: ['Greece', 'Hellas', 'Piraeus', 'Athens', 'Europe'],
    portType: 'Balkan & East Med Gateway Hub',
    continent: 'Europe',
    isEurope: true,
    coords: [23.63, 37.93],
  },

  // ==========================================
  // MOROCCO 🇲🇦
  // ==========================================
  {
    id: 'MATNG',
    name: 'Tanger Med (Strait of Gibraltar)',
    country: 'Morocco',
    flag: '🇲🇦',
    countryCode: 'MA',
    aliases: ['Morocco', 'Maroc', 'Tangier', 'Tanger Med', 'Gibraltar'],
    portType: 'Africa #1 Container Port (9M TEU)',
    continent: 'Africa',
    isEurope: false,
    coords: [-5.50, 35.88],
  },
];

/**
 * Intelligent Port & Country Search
 * Matches country name, country aliases, port name, UN/LOCODE, or port type.
 */
/**
 * Intelligent Port & Country Search
 * Matches country name, country aliases, port name, UN/LOCODE, or port type.
 */
export function searchPorts(query) {
  if (!query || !query.trim()) return GLOBAL_PORTS;
  const q = query.trim().toLowerCase();

  return GLOBAL_PORTS.filter((port) => {
    const cLower = port.country.toLowerCase();
    const codeLower = (port.countryCode || '').toLowerCase();

    // 1. Exact or prefix match on Country Name (e.g. 'india', 'ind', 'united states')
    if (cLower === q || cLower.startsWith(q)) return true;
    if (q.length >= 4 && cLower.includes(q)) return true;

    // 2. Exact match on 2-letter or 3-letter Country Code (e.g. 'in', 'us', 'ae', 'cn', 'uk')
    if (codeLower === q) return true;

    // 3. Match on Country Aliases (e.g. 'bharat', 'usa', 'uk', 'emirates')
    if (port.aliases && port.aliases.some((a) => {
      const al = a.toLowerCase();
      return al === q || (q.length >= 4 && al.startsWith(q));
    })) {
      return true;
    }

    // 4. Continent / Region Match (e.g. 'europe', 'asia', 'africa', 'middle east')
    if (q === 'europe' && port.isEurope) return true;
    if (port.continent && port.continent.toLowerCase() === q) return true;

    // 5. Port Code (UN/LOCODE) match (e.g. 'INBOM', 'USLAX', 'CNSHA')
    if (port.id.toLowerCase().startsWith(q) || port.id.toLowerCase() === q) return true;

    // 6. Port Name / City matching
    const nameLower = port.name.toLowerCase();
    if (q.length <= 3) {
      const words = nameLower.split(/[\s,()\-]+/);
      if (words.some((w) => w.startsWith(q))) return true;
    } else {
      if (nameLower.includes(q)) return true;
    }

    return false;
  });
}
