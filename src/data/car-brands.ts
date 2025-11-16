export interface CarBrand {
  name: string;
  models: string[];
}

const brandsData: CarBrand[] = [
  {
    name: "Toyota",
    models: ["4Runner", "86", "Alphard", "Aqua", "Aurion", "Auris", "Avalon", "Avanza", "Avensis", "bZ3", "bZ4X", "C-HR", "Caldina", "Camry", "Carina", "Celica", "Century", "Chaser", "Commuter", "Corolla", "Corolla Cross", "Corona", "Cressida", "Crown", "Dyna", "Estima", "FJ Cruiser", "Fortuner", "GR86", "GR Corolla", "GR Supra", "GR Yaris", "Granvia", "Harrier", "Hiace", "Highlander", "Hilux", "Innova", "iQ", "ist", "Land Cruiser", "Land Cruiser Prado", "Mark II", "Mark X", "Matrix", "Mirai", "MR2", "Noah", "Paseo", "Passo", "Picnic", "Platz", "Previa", "Prius", "Prius Alpha", "Prius C", "Prius Prime", "Probox", "Ractis", "RAV4", "Raize", "Regius", "Rush", "Sai", "Sequoia", "Sienna", "Sienta", "Solara", "Soarer", "Sprinter", "Starlet", "Succeed", "Supra", "Tacoma", "Tercel", "TownAce", "Tundra", "Urban Cruiser", "Vanguard", "Venza", "Verossa", "Verso", "Vios", "Vitz", "Voxy", "Wish", "Yaris", "Yaris Cross"]
  },
  {
    name: "BMW",
    models: ["1 Series", "2 Series", "2 Series Active Tourer", "2 Series Gran Coupe", "2 Series Gran Tourer", "3 Series", "3 Series GT", "4 Series", "4 Series Gran Coupe", "5 Series", "5 Series GT", "6 Series", "6 Series Gran Coupe", "6 Series GT", "7 Series", "8 Series", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX3", "M2", "M3", "M4", "M5", "M6", "M8", "X1", "X2", "X3", "X3 M", "X4", "X4 M", "X5", "X5 M", "X6", "X6 M", "X7", "XM", "Z3", "Z4", "Z8"]
  },
  {
    name: "Mercedes-Benz",
    models: ["A-Class", "AMG GT", "AMG GT 4-Door", "B-Class", "C-Class", "CL-Class", "CLA", "CLC", "CLK", "CLS", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQE SUV", "EQS", "EQS SUV", "EQV", "G-Class", "GL-Class", "GLA", "GLB", "GLC", "GLC Coupe", "GLE", "GLE Coupe", "GLK", "GLS", "Maybach S-Class", "ML-Class", "R-Class", "S-Class", "SL", "SLC", "SLK", "SLR McLaren", "SLS AMG", "Sprinter", "V-Class", "Vario", "Viano", "Vito", "X-Class"]
  },
  {
    name: "Audi",
    models: ["100", "80", "A1", "A2", "A3", "A4", "A4 allroad", "A5", "A6", "A6 allroad", "A7", "A8", "e-tron", "e-tron GT", "Q2", "Q3", "Q3 Sportback", "Q4 e-tron", "Q4 e-tron Sportback", "Q5", "Q5 Sportback", "Q7", "Q8", "Q8 e-tron", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "RS e-tron GT", "RS Q3", "RS Q8", "S3", "S4", "S5", "S6", "S7", "S8", "SQ5", "SQ7", "SQ8", "TT", "TT RS", "TTS"]
  },
  {
    name: "Volkswagen",
    models: ["Amarok", "Arteon", "Atlas", "Beetle", "Bora", "Caddy", "Caravelle", "CC", "Corrado", "Crafter", "CrossGolf", "Derby", "Eos", "Fox", "Golf", "Golf GTI", "Golf R", "Golf Sportsvan", "ID.3", "ID.4", "ID.5", "ID.6", "ID.7", "ID. Buzz", "Jetta", "Lavida", "Lupo", "Multivan", "New Beetle", "Passat", "Passat CC", "Phaeton", "Pointer", "Polo", "Polo GTI", "Santana", "Scirocco", "Sharan", "T-Cross", "T-Roc", "Taos", "Tavendor", "Teramont", "Tiguan", "Tiguan Allspace", "Touareg", "Touran", "Transporter", "Up", "Vento"]
  },
  {
    name: "Hyundai",
    models: ["Accent", "Atos", "Avante", "Azera", "Bayon", "Casper", "Creta", "Elantra", "Entourage", "Equus", "Excel", "Genesis", "Genesis Coupe", "Getz", "Grand Santa Fe", "Grandeur", "H-1", "H100", "i10", "i20", "i30", "i40", "Ioniq", "Ioniq 5", "Ioniq 6", "ix20", "ix35", "ix55", "Kona", "Kona Electric", "Lantra", "Matrix", "Maxcruz", "Palisade", "Santa Cruz", "Santa Fe", "Santamo", "Solaris", "Sonata", "Starex", "Staria", "Terracan", "Trajet", "Tucson", "Veloster", "Venue", "Veracruz", "Verna", "XG"]
  },
  {
    name: "Kia",
    models: ["Avella", "Besta", "Bongo", "Cadenza", "Carens", "Carnival", "Ceed", "Cerato", "Clarus", "EV6", "EV9", "Forte", "K2", "K3", "K4", "K5", "K7", "K8", "K9", "Magentis", "Mohave", "Morning", "Niro", "Niro EV", "Opirus", "Optima", "Pegas", "Picanto", "Pregio", "Pride", "ProCeed", "Quoris", "Ray", "Retona", "Rio", "Sedona", "Seltos", "Sephia", "Shuma", "Sorento", "Soul", "Soul EV", "Spectra", "Sportage", "Stinger", "Stonic", "Telluride", "Venga", "XCeed"]
  },
  {
    name: "Nissan",
    models: ["350Z", "370Z", "AD", "Almera", "Almera Classic", "Altima", "Ariya", "Armada", "Avenir", "Bluebird", "Caravan", "Cedric", "Cefiro", "Cima", "Cube", "Dayz", "Dualis", "Elgrand", "Figaro", "Frontier", "Fuga", "GT-R", "Juke", "Kicks", "Lafesta", "Laurel", "Leaf", "Liberty", "March", "Maxima", "Micra", "Mistral", "Murano", "Navara", "Note", "NP300", "NV200", "NV350", "Pathfinder", "Patrol", "Presage", "Presea", "Primera", "Pulsar", "Qashqai", "Quest", "Rogue", "Sakura", "Sentra", "Serena", "Silvia", "Skyline", "Stagea", "Sunny", "Teana", "Terrano", "Tiida", "Titan", "Versa", "Wingroad", "X-Terra", "X-Trail", "Xterra"]
  },
  {
    name: "Mazda",
    models: ["2", "3", "5", "6", "323", "626", "929", "Atenza", "Axela", "Biante", "Bongo", "BT-50", "Capella", "Carol", "CX-3", "CX-30", "CX-4", "CX-5", "CX-50", "CX-60", "CX-7", "CX-8", "CX-9", "CX-90", "Demio", "Eunos", "Flair", "Laputa", "Mazda2", "Mazda3", "Mazda5", "Mazda6", "MPV", "MX-3", "MX-5", "MX-30", "MX-6", "Premacy", "Protege", "RX-7", "RX-8", "Scrum", "Tribute", "Verisa"]
  },
  {
    name: "Honda",
    models: ["Accord", "Accord Hybrid", "Acty", "Airwave", "Amaze", "Ascot", "Avancier", "Ballade", "Brio", "City", "Civic", "Civic Hybrid", "Civic Type R", "Clarity", "Concerto", "Crossroad", "CR-V", "CR-Z", "Crosstour", "Domani", "e", "Edix", "Element", "Elysion", "Fit", "Freed", "Grace", "HR-V", "Insight", "Inspire", "Integra", "Jazz", "Jade", "Legend", "Life", "Mobilio", "N-Box", "N-One", "N-Van", "N-WGN", "Odyssey", "Orthia", "Partner", "Passport", "Pilot", "Prelude", "Prologue", "Rafaga", "Ridgeline", "S2000", "Shuttle", "Step WGN", "Stream", "That's", "Torneo", "Vamos", "Vezel", "Vigor", "WR-V", "ZR-V"]
  },
  {
    name: "Ford",
    models: ["Aerostar", "Aspire", "B-Max", "Bronco", "Bronco Sport", "C-Max", "Contour", "Cougar", "Crown Victoria", "EcoSport", "Edge", "Escape", "Escort", "Excursion", "Expedition", "Explorer", "Explorer Sport Trac", "F-150", "F-250", "F-350", "Festiva", "Fiesta", "Five Hundred", "Flex", "Focus", "Focus RS", "Focus ST", "Freestar", "Freestyle", "Fusion", "Galaxy", "Granada", "Grand C-Max", "GT", "Ka", "Kuga", "Maverick", "Mondeo", "Mustang", "Mustang Mach-E", "Probe", "Puma", "Ranger", "S-Max", "Scorpio", "Sierra", "Super Duty", "Taurus", "Taurus X", "Thunderbird", "Tourneo Connect", "Tourneo Custom", "Transit", "Transit Connect", "Transit Custom", "Windstar"]
  },
  {
    name: "Chevrolet",
    models: ["Alero", "Astro", "Avalanche", "Aveo", "Blazer", "Bolt", "Bolt EUV", "Camaro", "Captiva", "Cavalier", "Cobalt", "Colorado", "Corvette", "Cruze", "Epica", "Equinox", "Express", "HHR", "Impala", "Lacetti", "Lanos", "Lumina", "Malibu", "Monte Carlo", "Nexia", "Niva", "Nubira", "Orlando", "Rezzo", "Silverado", "Sonic", "Spark", "Suburban", "Tahoe", "Tracker", "TrailBlazer", "Traverse", "Trax", "Uplander", "Venture", "Volt"]
  },
  {
    name: "Lexus",
    models: ["CT", "ES", "GS", "GX", "HS", "IS", "LC", "LFA", "LM", "LS", "LX", "NX", "RC", "RC F", "RX", "RZ", "SC", "UX", "UX300e"]
  },
  {
    name: "Subaru",
    models: ["Ascent", "B9 Tribeca", "Baja", "BRZ", "Crosstrek", "Dex", "Domingo", "Exiga", "Forester", "Impreza", "Impreza WRX", "Impreza WRX STI", "Justy", "Legacy", "Legacy B4", "Leone", "Levorg", "Libero", "Outback", "Pleo", "Rex", "Sambar", "Solterra", "Stella", "SVX", "Traviq", "Trezia", "Tribeca", "Vivio", "WRX", "WRX STI", "XV", "XT"]
  },
  {
    name: "Mitsubishi",
    models: ["3000GT", "ASX", "Attrage", "Carisma", "Colt", "Delica", "Diamante", "Eclipse", "Eclipse Cross", "Endeavor", "Galant", "Grandis", "i-MiEV", "L200", "L300", "Lancer", "Lancer Evolution", "Mirage", "Montero", "Montero Sport", "Outlander", "Outlander Sport", "Pajero", "Pajero iO", "Pajero Mini", "Pajero Pinin", "Pajero Sport", "RVR", "Sigma", "Space Runner", "Space Star", "Space Wagon", "Xpander"]
  },
  {
    name: "Renault",
    models: ["Alaskan", "Arkana", "Avantime", "Captur", "Clio", "Duster", "Espace", "Fluence", "Kadjar", "Kangoo", "Kaptur", "Koleos", "Laguna", "Latitude", "Logan", "Master", "Megane", "Modus", "Pulse", "Safrane", "Sandero", "Sandero Stepway", "Scala", "Scenic", "Symbol", "Talisman", "Thalia", "Trafic", "Twingo", "Twizy", "Vel Satis", "Wind", "Zoe"]
  },
  {
    name: "Lada",
    models: ["110", "111", "112", "1111 Oka", "1200", "1300", "1500", "1600", "2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "21099", "2110", "2111", "2112", "2113", "2114", "2115", "2120 Надежда", "4x4", "Granta", "Kalina", "Largus", "Niva", "Niva Legend", "Niva Travel", "Priora", "Samara", "Vesta", "XRAY"]
  },
  {
    name: "Geely",
    models: ["Atlas", "Atlas Pro", "Bin Rui", "Bingyue", "Coolray", "Emgrand", "Emgrand EC7", "Emgrand GS", "Emgrand GT", "Emgrand X7", "GC6", "GC7", "GC9", "Geometry A", "Geometry C", "Geometry E", "Haoqing", "MK", "Monjaro", "Okavango", "Panda", "Preface", "SC7", "Starry", "Tugella", "Vision", "X7"]
  },
  {
    name: "Chery",
    models: ["Amulet", "Arrizo 3", "Arrizo 5", "Arrizo 6", "Arrizo 7", "Arrizo 8", "Bonus", "Crosseastar", "E5", "Eastar", "Exeed LX", "Exeed RX", "Exeed TXL", "Exeed VX", "Fora", "IndiS", "Jaggi", "Kimo", "M11", "Omoda C5", "Omoda S5", "Oriental Son", "QQ", "QQ6", "Tiggo", "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 5", "Tiggo 7", "Tiggo 8", "Tiggo FL", "Very"]
  },
  {
    name: "Haval",
    models: ["Dargo", "F5", "F7", "F7x", "H2", "H3", "H5", "H6", "H7", "H8", "H9", "Jolion", "M6"]
  },
  {
    name: "Skoda",
    models: ["Citigo", "Enyaq", "Fabia", "Favorit", "Felicia", "Forman", "Karoq", "Kamiq", "Kodiaq", "Kushaq", "Octavia", "Octavia RS", "Praktik", "Rapid", "Roomster", "Scala", "Superb", "Yeti"]
  },
  {
    name: "Peugeot",
    models: ["1007", "106", "107", "108", "2008", "206", "207", "208", "3008", "301", "306", "307", "308", "4007", "4008", "405", "406", "407", "408", "5008", "504", "505", "508", "605", "607", "806", "807", "Bipper", "Boxer", "e-2008", "e-208", "Expert", "iOn", "Partner", "RCZ", "Rifter", "Traveller"]
  },
  {
    name: "Citroen",
    models: ["Berlingo", "BX", "C1", "C2", "C3", "C3 Aircross", "C3 Picasso", "C4", "C4 Aircross", "C4 Cactus", "C4 Picasso", "C5", "C5 Aircross", "C5 X", "C6", "C8", "C-Crosser", "C-Elysee", "Dispatch", "DS3", "DS4", "DS5", "e-Berlingo", "e-C4", "Evasion", "Grand C4 Picasso", "Grand C4 SpaceTourer", "Jumper", "Jumpy", "Nemo", "Saxo", "SpaceTourer", "Xantia", "XM", "Xsara", "Xsara Picasso", "ZX"]
  },
  {
    name: "Volvo",
    models: ["240", "340", "360", "440", "460", "480", "740", "760", "850", "940", "960", "C30", "C40 Recharge", "C70", "EX30", "EX90", "S40", "S60", "S70", "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC40 Recharge", "XC60", "XC70", "XC90"]
  },
  {
    name: "Porsche",
    models: ["718 Boxster", "718 Cayman", "911", "918 Spyder", "924", "928", "944", "959", "968", "Boxster", "Carrera GT", "Cayenne", "Cayenne Coupe", "Cayman", "Macan", "Panamera", "Taycan", "Taycan Cross Turismo"]
  },
  {
    name: "Jaguar",
    models: ["E-Pace", "F-Pace", "F-Type", "I-Pace", "S-Type", "X-Type", "XE", "XF", "XJ", "XJR", "XK", "XKR"]
  },
  {
    name: "Land Rover",
    models: ["Defender", "Defender 90", "Defender 110", "Defender 130", "Discovery", "Discovery 3", "Discovery 4", "Discovery 5", "Discovery Sport", "Freelander", "Freelander 2", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"]
  },
  {
    name: "Tesla",
    models: ["Model S", "Model 3", "Model X", "Model Y"]
  },
  {
    name: "Genesis",
    models: ["G70", "G80", "G90", "GV60", "GV70", "GV80"]
  },
  {
    name: "Infiniti",
    models: ["EX", "FX", "G", "I", "J", "JX", "M", "Q30", "Q40", "Q45", "Q50", "Q60", "Q70", "QX30", "QX4", "QX50", "QX55", "QX56", "QX60", "QX70", "QX80"]
  },
  {
    name: "Acura",
    models: ["ILX", "TLX", "RDX", "MDX", "NSX"]
  },
  {
    name: "Jeep",
    models: ["Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Grand Wagoneer", "Liberty", "Patriot", "Renegade", "Wagoneer", "Wrangler", "Wrangler Unlimited"]
  },
  {
    name: "Dodge",
    models: ["Avenger", "Caliber", "Caravan", "Challenger", "Charger", "Dart", "Durango", "Grand Caravan", "Journey", "Magnum", "Neon", "Nitro", "Ram", "Viper"]
  },
  {
    name: "Chrysler",
    models: ["300", "Pacifica", "Voyager"]
  },
  {
    name: "Buick",
    models: ["Encore", "Envision", "Enclave"]
  },
  {
    name: "Cadillac",
    models: ["ATS", "Brougham", "CT4", "CT5", "CT6", "CTS", "DeVille", "DTS", "Eldorado", "Escalade", "Escalade ESV", "EXT", "Fleetwood", "Lyriq", "Seville", "SRX", "STS", "XLR", "XT4", "XT5", "XT6"]
  },
  {
    name: "GMC",
    models: ["Terrain", "Acadia", "Yukon", "Sierra"]
  },
  {
    name: "Suzuki",
    models: ["Alto", "Baleno", "Celerio", "Ciaz", "Ertiga", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "S-Cross", "SX4", "Swift", "Vitara", "Wagon R", "XL7"]
  },
  {
    name: "Isuzu",
    models: ["D-Max", "MU-X"]
  },
  {
    name: "Great Wall",
    models: ["Wingle", "Poer", "Pao", "Tank 300", "Tank 500"]
  },
  {
    name: "BYD",
    models: ["Atto 3", "Dolphin", "e2", "e3", "e5", "e6", "F0", "F3", "F6", "G3", "G5", "G6", "Han", "L3", "Qin", "Qin Plus", "S2", "S6", "S7", "Sea Lion", "Seal", "Song", "Song Plus", "Tang", "Yuan"]
  },
  {
    name: "Changan",
    models: ["Alsvin", "Benni", "CS15", "CS35", "CS35 Plus", "CS55", "CS55 Plus", "CS75", "CS75 Plus", "CS85", "CS95", "Eado", "Eado Plus", "Eado XT", "Raeton", "UNI-K", "UNI-T", "UNI-V"]
  },
  {
    name: "FAW",
    models: ["Besturn B50", "Besturn X80", "Oley"]
  },
  {
    name: "JAC",
    models: ["S3", "S4", "S5", "S7"]
  },
  {
    name: "SsangYong",
    models: ["Tivoli", "Korando", "Rexton", "Musso"]
  },
  {
    name: "Alfa Romeo",
    models: ["Giulia", "Stelvio", "Tonale", "Giulietta"]
  },
  {
    name: "Fiat",
    models: ["500", "Panda", "Tipo", "500X", "500L", "Doblo", "Ducato"]
  },
  {
    name: "Mini",
    models: ["Cooper", "Countryman", "Clubman", "Convertible"]
  },
  {
    name: "Smart",
    models: ["Fortwo", "Forfour", "#1", "#3"]
  },
  {
    name: "Bentley",
    models: ["Continental", "Flying Spur", "Bentayga"]
  },
  {
    name: "Rolls-Royce",
    models: ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan"]
  },
  {
    name: "Lamborghini",
    models: ["Huracan", "Aventador", "Urus", "Revuelto"]
  },
  {
    name: "Ferrari",
    models: ["Roma", "Portofino", "F8", "812", "SF90", "296", "Purosangue"]
  },
  {
    name: "Maserati",
    models: ["Ghibli", "Quattroporte", "Levante", "GranTurismo", "GranCabrio", "MC20", "Grecale"]
  },
  {
    name: "Aston Martin",
    models: ["DB11", "DBS", "Vantage", "DBX"]
  },
  {
    name: "McLaren",
    models: ["GT", "Artura", "720S", "765LT"]
  },
  {
    name: "UAZ",
    models: ["Patriot", "Hunter", "Pickup", "3303"]
  },
  {
    name: "Seat",
    models: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"]
  },
  {
    name: "Opel",
    models: ["Corsa", "Astra", "Insignia", "Crossland", "Grandland", "Mokka"]
  },
  {
    name: "Dacia",
    models: ["Sandero", "Logan", "Duster", "Spring", "Jogger"]
  },
  {
    name: "Saab",
    models: ["9-3", "9-5"]
  },
  {
    name: "Hongqi",
    models: ["H5", "H9", "HS5", "E-HS9"]
  },
  {
    name: "Lynk & Co",
    models: ["01", "02", "03", "05", "06", "09"]
  },
  {
    name: "Polestar",
    models: ["2", "3", "4"]
  },
  {
    name: "Rivian",
    models: ["R1T", "R1S"]
  },
  {
    name: "Lucid",
    models: ["Air"]
  },
  {
    name: "NIO",
    models: ["ES6", "ES8", "ET5", "ET7"]
  },
  {
    name: "Xpeng",
    models: ["P5", "P7", "G3", "G9"]
  },
  {
    name: "Li Auto",
    models: ["L7", "L8", "L9"]
  },
  {
    name: "MG",
    models: ["ZS", "HS", "5", "6", "Marvel R"]
  },
  {
    name: "GAZ",
    models: ["Gazelle", "Sobol", "Valdai"]
  },
  {
    name: "ZAZ",
    models: ["Lanos", "Sens", "Forza", "Vida"]
  },
  {
    name: "Daewoo",
    models: ["Nexia", "Matiz", "Gentra", "Lacetti"]
  },
  {
    name: "Lifan",
    models: ["X60", "X70", "Solano", "Myway"]
  },
  {
    name: "DongFeng",
    models: ["AX7", "580", "S30"]
  },
  {
    name: "Zotye",
    models: ["T600", "Z300", "X7"]
  },
  {
    name: "Brilliance",
    models: ["V5", "H530", "H330"]
  },
  {
    name: "Foton",
    models: ["Sauvana", "Tunland", "Gratour"]
  },
  {
    name: "Hummer",
    models: ["H2", "H3", "EV"]
  },
  {
    name: "Lincoln",
    models: ["Navigator", "Aviator", "Corsair", "Nautilus"]
  },
  {
    name: "RAM",
    models: ["1500", "2500", "3500"]
  },
  {
    name: "Lotus",
    models: ["Emira", "Eletre"]
  }
];

// Сортируем марки по алфавиту
export const carBrands: CarBrand[] = brandsData.sort((a, b) => a.name.localeCompare(b.name, 'en'));

export const getCarBrands = (): string[] => {
  return carBrands.map(brand => brand.name).sort((a, b) => a.localeCompare(b, 'en'));
};

export const getCarModels = (brandName: string): string[] => {
  const brand = carBrands.find(b => b.name === brandName);
  return brand ? brand.models.sort((a, b) => a.localeCompare(b, 'en')) : [];
};
