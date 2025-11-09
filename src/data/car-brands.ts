export interface CarBrand {
  name: string;
  models: string[];
}

export const carBrands: CarBrand[] = [
  {
    name: "Toyota",
    models: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Highlander", "Prius", "Yaris", "Avalon", "4Runner", "Tacoma", "Tundra", "Sienna", "Sequoia", "Venza", "C-HR", "Supra", "86", "Fortuner", "Hilux", "Prado"]
  },
  {
    name: "BMW",
    models: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "iX", "M2", "M3", "M4", "M5", "M8"]
  },
  {
    name: "Mercedes-Benz",
    models: ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "V-Class", "AMG GT", "EQA", "EQB", "EQC", "EQE", "EQS"]
  },
  {
    name: "Audi",
    models: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "TT", "R8", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7"]
  },
  {
    name: "Volkswagen",
    models: ["Polo", "Golf", "Jetta", "Passat", "Tiguan", "Touareg", "Arteon", "T-Roc", "T-Cross", "ID.3", "ID.4", "ID.5", "Caddy", "Multivan", "Amarok"]
  },
  {
    name: "Hyundai",
    models: ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Creta", "Venue", "Kona", "Ioniq", "i10", "i20", "i30", "Veloster", "Genesis"]
  },
  {
    name: "Kia",
    models: ["Rio", "Cerato", "K5", "Stinger", "Sportage", "Sorento", "Seltos", "Soul", "Picanto", "Carnival", "EV6", "Niro", "Stonic", "Mohave"]
  },
  {
    name: "Nissan",
    models: ["Almera", "Sentra", "Altima", "Maxima", "Qashqai", "X-Trail", "Murano", "Pathfinder", "Patrol", "Juke", "Kicks", "Leaf", "GT-R", "370Z", "Navara"]
  },
  {
    name: "Mazda",
    models: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "MX-5", "CX-50", "CX-60", "CX-90"]
  },
  {
    name: "Honda",
    models: ["Civic", "Accord", "CR-V", "HR-V", "Pilot", "Passport", "Odyssey", "Fit", "Insight", "Ridgeline", "e:Ny1"]
  },
  {
    name: "Ford",
    models: ["Fiesta", "Focus", "Mondeo", "Mustang", "EcoSport", "Kuga", "Edge", "Explorer", "Expedition", "F-150", "Ranger", "Bronco", "Maverick"]
  },
  {
    name: "Chevrolet",
    models: ["Spark", "Aveo", "Cruze", "Malibu", "Camaro", "Corvette", "Trax", "Equinox", "Traverse", "Tahoe", "Suburban", "Silverado", "Colorado"]
  },
  {
    name: "Lexus",
    models: ["IS", "ES", "GS", "LS", "UX", "NX", "RX", "GX", "LX", "LC", "RC", "RZ"]
  },
  {
    name: "Subaru",
    models: ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "WRX", "BRZ", "Solterra"]
  },
  {
    name: "Mitsubishi",
    models: ["Mirage", "Lancer", "Galant", "ASX", "Eclipse Cross", "Outlander", "Pajero", "L200", "Xpander"]
  },
  {
    name: "Renault",
    models: ["Logan", "Sandero", "Duster", "Kaptur", "Arkana", "Megane", "Clio", "Koleos", "Talisman", "Zoe"]
  },
  {
    name: "Lada",
    models: ["Granta", "Vesta", "Largus", "Niva", "Niva Travel", "Niva Legend", "XRAY"]
  },
  {
    name: "Geely",
    models: ["Emgrand", "Atlas", "Coolray", "Tugella", "Monjaro", "Okavango", "GC6", "X7", "Geometry C"]
  },
  {
    name: "Chery",
    models: ["Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6", "Arrizo 8", "Omoda C5", "Exeed TXL", "Exeed VX"]
  },
  {
    name: "Haval",
    models: ["Jolion", "F7", "F7x", "Dargo", "H6", "H9", "M6"]
  },
  {
    name: "Skoda",
    models: ["Fabia", "Rapid", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"]
  },
  {
    name: "Peugeot",
    models: ["208", "308", "508", "2008", "3008", "5008", "Rifter", "Traveller", "e-208", "e-2008"]
  },
  {
    name: "Citroen",
    models: ["C3", "C4", "C5 Aircross", "Berlingo", "SpaceTourer", "e-C4"]
  },
  {
    name: "Volvo",
    models: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40 Recharge", "XC40 Recharge"]
  },
  {
    name: "Porsche",
    models: ["911", "718", "Cayenne", "Macan", "Panamera", "Taycan"]
  },
  {
    name: "Jaguar",
    models: ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"]
  },
  {
    name: "Land Rover",
    models: ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"]
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
    models: ["Q50", "Q60", "QX50", "QX55", "QX60", "QX80"]
  },
  {
    name: "Acura",
    models: ["ILX", "TLX", "RDX", "MDX", "NSX"]
  },
  {
    name: "Jeep",
    models: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Wagoneer"]
  },
  {
    name: "Dodge",
    models: ["Charger", "Challenger", "Durango"]
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
    models: ["CT4", "CT5", "XT4", "XT5", "XT6", "Escalade", "Lyriq"]
  },
  {
    name: "GMC",
    models: ["Terrain", "Acadia", "Yukon", "Sierra"]
  },
  {
    name: "Suzuki",
    models: ["Swift", "Vitara", "S-Cross", "Jimny", "Ignis"]
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
    models: ["Han", "Tang", "Song", "Qin", "Dolphin", "Seal", "Atto 3"]
  },
  {
    name: "Changan",
    models: ["CS35", "CS55", "CS75", "CS85", "UNI-K", "UNI-T", "Alsvin"]
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
    name: "Ssangyong",
    models: ["Tivoli", "Korando", "Rexton", "Musso"]
  },
  {
    name: "Alfa Romeo",
    models: ["Giulia", "Stelvio", "Tonale"]
  },
  {
    name: "Fiat",
    models: ["500", "Panda", "Tipo", "500X", "Doblo"]
  },
  {
    name: "Mini",
    models: ["Cooper", "Countryman", "Clubman", "Electric"]
  },
  {
    name: "Smart",
    models: ["Fortwo", "Forfour", "#1"]
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
  }
];

export const getCarBrands = (): string[] => {
  return carBrands.map(brand => brand.name).sort((a, b) => a.localeCompare(b, 'en'));
};

export const getCarModels = (brandName: string): string[] => {
  const brand = carBrands.find(b => b.name === brandName);
  return brand ? brand.models.sort((a, b) => a.localeCompare(b, 'en')) : [];
};
