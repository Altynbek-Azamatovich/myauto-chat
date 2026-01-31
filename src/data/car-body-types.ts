/**
 * Маппинг моделей автомобилей к типам кузова
 * 
 * Типы кузовов:
 * - sedan: легковые (седаны, хэтчбеки, купе, лифтбеки)
 * - crossover: кроссоверы (компактные SUV, городские внедорожники)
 * - suv: внедорожники (полноразмерные SUV, пикапы, рамные внедорожники)
 * - minivan: минивены (микроавтобусы, MPV)
 */

export type BodyType = 'sedan' | 'crossover' | 'suv' | 'minivan';

// Модели-внедорожники (SUV, пикапы, рамные внедорожники)
const suvModels: string[] = [
  // Toyota
  '4Runner', 'Land Cruiser', 'Land Cruiser Prado', 'Sequoia', 'Tundra', 'Tacoma', 'FJ Cruiser', 'Hilux',
  // Nissan
  'Patrol', 'Armada', 'Titan', 'Frontier', 'Navara', 'X-Terra', 'Xterra', 'Pathfinder',
  // Ford
  'F-150', 'F-250', 'F-350', 'Ranger', 'Bronco', 'Expedition', 'Excursion', 'Super Duty',
  // Chevrolet
  'Silverado', 'Colorado', 'Tahoe', 'Suburban', 'Avalanche', 'TrailBlazer',
  // GMC
  'Sierra', 'Yukon', 'Canyon',
  // Dodge/RAM
  'Ram', '1500', '2500', '3500', 'Durango',
  // Jeep
  'Wrangler', 'Wrangler Unlimited', 'Gladiator', 'Grand Cherokee', 'Cherokee', 'Commander', 'Wagoneer', 'Grand Wagoneer',
  // Mitsubishi
  'Pajero', 'Pajero Sport', 'Montero', 'Montero Sport', 'L200',
  // Land Rover
  'Defender', 'Defender 90', 'Defender 110', 'Defender 130', 'Range Rover', 'Range Rover Sport', 'Discovery', 'Discovery 3', 'Discovery 4', 'Discovery 5',
  // Mercedes
  'G-Class', 'GL-Class', 'GLS', 'X-Class',
  // Lexus
  'LX', 'GX',
  // Infiniti
  'QX56', 'QX80',
  // Cadillac
  'Escalade', 'Escalade ESV',
  // Lincoln
  'Navigator',
  // Hummer
  'H2', 'H3', 'EV',
  // UAZ
  'Patriot', 'Hunter', 'Pickup', '3303',
  // Great Wall
  'Wingle', 'Poer', 'Pao', 'Tank 300', 'Tank 500',
  // Isuzu
  'D-Max', 'MU-X',
  // SsangYong
  'Rexton', 'Musso',
  // Lada
  'Niva', '4x4', 'Niva Legend', 'Niva Travel',
  // Haval
  'H9',
  // Volkswagen
  'Amarok',
  // Honda
  'Ridgeline', 'Passport', 'Pilot',
  // Subaru
  'Ascent',
];

// Модели-кроссоверы
const crossoverModels: string[] = [
  // Toyota
  'RAV4', 'Highlander', 'Venza', 'C-HR', 'Harrier', 'Corolla Cross', 'Yaris Cross', 'Raize', 'Urban Cruiser', 'Rush', 'Fortuner', 'bZ4X',
  // Nissan
  'Qashqai', 'X-Trail', 'Rogue', 'Murano', 'Juke', 'Kicks', 'Dualis', 'Terrano', 'Ariya',
  // Honda
  'CR-V', 'HR-V', 'Vezel', 'ZR-V', 'WR-V', 'Crossroad', 'Element', 'Crosstour',
  // Mazda
  'CX-3', 'CX-30', 'CX-4', 'CX-5', 'CX-50', 'CX-60', 'CX-7', 'CX-8', 'CX-9', 'CX-90', 'MX-30',
  // Hyundai
  'Tucson', 'Santa Fe', 'Kona', 'Creta', 'Venue', 'Bayon', 'ix35', 'ix55', 'Veracruz', 'Palisade', 'Ioniq 5', 'Ioniq 6',
  // Kia
  'Sportage', 'Sorento', 'Seltos', 'Niro', 'Stonic', 'Soul', 'XCeed', 'EV6', 'EV9', 'Telluride', 'Mohave',
  // Ford
  'Escape', 'Edge', 'Explorer', 'Kuga', 'EcoSport', 'Bronco Sport', 'Maverick', 'Puma', 'Mustang Mach-E',
  // Chevrolet
  'Equinox', 'Traverse', 'Trax', 'Tracker', 'Blazer', 'Captiva', 'Bolt EUV',
  // Volkswagen
  'Tiguan', 'Tiguan Allspace', 'Touareg', 'T-Cross', 'T-Roc', 'Taos', 'Teramont', 'Atlas', 'ID.4', 'ID.5', 'ID.6',
  // BMW
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'iX', 'iX1', 'iX3', 'XM', 'X3 M', 'X4 M', 'X5 M', 'X6 M',
  // Mercedes
  'GLA', 'GLB', 'GLC', 'GLC Coupe', 'GLE', 'GLE Coupe', 'GLK', 'EQA', 'EQB', 'EQC', 'EQE SUV', 'EQS SUV',
  // Audi
  'Q2', 'Q3', 'Q3 Sportback', 'Q4 e-tron', 'Q4 e-tron Sportback', 'Q5', 'Q5 Sportback', 'Q7', 'Q8', 'Q8 e-tron', 'e-tron',
  // Lexus
  'NX', 'RX', 'UX', 'RZ', 'UX300e',
  // Infiniti
  'QX30', 'QX50', 'QX55', 'QX60', 'QX70',
  // Subaru
  'Forester', 'Outback', 'XV', 'Crosstrek', 'Solterra',
  // Mitsubishi
  'ASX', 'Outlander', 'Outlander Sport', 'Eclipse Cross', 'RVR',
  // Volvo
  'XC40', 'XC60', 'XC70', 'XC90', 'XC40 Recharge', 'C40 Recharge', 'EX30', 'EX90',
  // Porsche
  'Cayenne', 'Cayenne Coupe', 'Macan',
  // Jaguar
  'E-Pace', 'F-Pace', 'I-Pace',
  // Land Rover
  'Range Rover Evoque', 'Range Rover Velar', 'Discovery Sport', 'Freelander', 'Freelander 2',
  // Peugeot
  '2008', '3008', '4007', '4008', '5008', 'e-2008',
  // Citroen
  'C3 Aircross', 'C4 Aircross', 'C5 Aircross', 'C-Crosser',
  // Renault
  'Duster', 'Kaptur', 'Kadjar', 'Koleos', 'Arkana',
  // Skoda
  'Karoq', 'Kamiq', 'Kodiaq', 'Kushaq', 'Enyaq',
  // Seat
  'Arona', 'Ateca', 'Tarraco',
  // Opel
  'Crossland', 'Grandland', 'Mokka',
  // Dacia
  'Duster',
  // Tesla
  'Model X', 'Model Y',
  // Genesis
  'GV60', 'GV70', 'GV80',
  // Geely
  'Atlas', 'Atlas Pro', 'Coolray', 'Monjaro', 'Tugella', 'Okavango',
  // Chery
  'Tiggo', 'Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 5', 'Tiggo 7', 'Tiggo 8', 'Tiggo FL', 'Exeed LX', 'Exeed RX', 'Exeed TXL', 'Exeed VX', 'Omoda C5',
  // Haval
  'Dargo', 'F5', 'F7', 'F7x', 'H2', 'H3', 'H5', 'H6', 'H7', 'H8', 'Jolion', 'M6',
  // BYD
  'Atto 3', 'Song', 'Song Plus', 'Tang', 'Yuan', 'Sea Lion',
  // Changan
  'CS15', 'CS35', 'CS35 Plus', 'CS55', 'CS55 Plus', 'CS75', 'CS75 Plus', 'CS85', 'CS95', 'UNI-K', 'UNI-T',
  // Mini
  'Countryman',
  // Alfa Romeo
  'Stelvio', 'Tonale',
  // Fiat
  '500X', '500L',
  // Maserati
  'Levante', 'Grecale',
  // Bentley
  'Bentayga',
  // Lamborghini
  'Urus',
  // Rolls-Royce
  'Cullinan',
  // Aston Martin
  'DBX',
  // Rivian
  'R1S',
  // Lucid
  // NIO
  'ES6', 'ES8',
  // Xpeng
  'G3', 'G9',
  // Li Auto
  'L7', 'L8', 'L9',
  // MG
  'ZS', 'HS', 'Marvel R',
  // Lotus
  'Eletre',
  // Polestar
  '3', '4',
  // Lynk & Co
  '01', '02', '05', '06', '09',
  // Hongqi
  'HS5', 'E-HS9',
  // DongFeng
  'AX7', '580',
  // Zotye
  'T600', 'X7',
  // JAC
  'S3', 'S4', 'S5', 'S7',
  // Foton
  'Sauvana',
  // Acura
  'RDX', 'MDX',
  // Buick
  'Encore', 'Envision', 'Enclave',
  // Cadillac
  'XT4', 'XT5', 'XT6', 'Lyriq', 'SRX',
  // Lincoln
  'Aviator', 'Corsair', 'Nautilus',
  // Suzuki
  'Grand Vitara', 'Vitara', 'S-Cross', 'Jimny', 'XL7',
  // Smart
  '#1', '#3',
];

// Модели-минивены (MPV, микроавтобусы)
const minivanModels: string[] = [
  // Toyota
  'Sienna', 'Alphard', 'Vellfire', 'Estima', 'Previa', 'Noah', 'Voxy', 'Granvia', 'Hiace', 'TownAce', 'Regius', 'Picnic', 'Wish', 'Avanza', 'Innova',
  // Honda
  'Odyssey', 'Step WGN', 'Elysion', 'Freed', 'Mobilio', 'Shuttle', 'Jade', 'Edix', 'Stream',
  // Nissan
  'Serena', 'Elgrand', 'Quest', 'NV200', 'NV350', 'Caravan', 'Lafesta', 'Presage',
  // Mazda
  'MPV', 'Premacy', 'Biante', '5', 'Mazda5',
  // Hyundai
  'Starex', 'Staria', 'H-1', 'Trajet', 'Entourage', 'Santamo',
  // Kia
  'Carnival', 'Sedona', 'Carens',
  // Ford
  'Galaxy', 'S-Max', 'Transit', 'Transit Connect', 'Tourneo Connect', 'Tourneo Custom', 'C-Max', 'Grand C-Max', 'Windstar', 'Freestar', 'Flex',
  // Volkswagen
  'Sharan', 'Touran', 'Multivan', 'Transporter', 'Caravelle', 'Caddy', 'ID. Buzz',
  // Mercedes
  'V-Class', 'Viano', 'Vito', 'Sprinter', 'B-Class', 'R-Class', 'EQV',
  // Chrysler
  'Pacifica', 'Voyager', 'Town & Country',
  // Dodge
  'Caravan', 'Grand Caravan', 'Journey',
  // Chevrolet
  'Orlando', 'Venture', 'Uplander', 'Express', 'Rezzo',
  // Peugeot
  '807', '806', 'Traveller', 'Rifter', 'Partner', 'Expert', 'Bipper', 'Boxer',
  // Citroen
  'C8', 'C4 Picasso', 'Grand C4 Picasso', 'C4 SpaceTourer', 'Grand C4 SpaceTourer', 'Berlingo', 'e-Berlingo', 'SpaceTourer', 'Jumpy', 'Jumper', 'Evasion', 'Dispatch', 'Nemo',
  // Renault
  'Espace', 'Scenic', 'Grand Scenic', 'Kangoo', 'Trafic', 'Master',
  // Opel
  'Zafira', 'Combo', 'Vivaro', 'Movano',
  // Fiat
  'Doblo', 'Ducato', 'Ulysse', 'Scudo', 'Fiorino', 'Multipla',
  // Seat
  'Alhambra',
  // Mitsubishi
  'Delica', 'Grandis', 'Space Wagon', 'Space Star', 'Space Runner', 'Xpander',
  // Subaru
  'Libero', 'Traviq', 'Exiga', 'Domingo', 'Sambar',
  // Lada
  'Largus', '2120 Надежда',
  // SsangYong
  'Rodius', 'Stavic', 'Korando Turismo',
  // GAZ
  'Gazelle', 'Sobol', 'Valdai',
  // Lexus
  'LM',
  // Dacia
  'Jogger', 'Lodgy', 'Dokker',
  // Suzuki
  'Ertiga',
  // BYD
  'e6',
  // Geely
  'Jiaji',
  // Foton
  'Gratour',
  // Honda
  'N-Van', 'N-Box', 'Vamos',
];

/**
 * Определяет тип кузова по модели автомобиля
 * @param model - Название модели
 * @returns Тип кузова (sedan по умолчанию)
 */
export function getBodyTypeFromModel(model?: string | null): BodyType {
  if (!model) return 'sedan';
  
  const normalizedModel = model.trim();
  
  // Проверяем внедорожники
  if (suvModels.some(m => normalizedModel.toLowerCase() === m.toLowerCase())) {
    return 'suv';
  }
  
  // Проверяем кроссоверы
  if (crossoverModels.some(m => normalizedModel.toLowerCase() === m.toLowerCase())) {
    return 'crossover';
  }
  
  // Проверяем минивены
  if (minivanModels.some(m => normalizedModel.toLowerCase() === m.toLowerCase())) {
    return 'minivan';
  }
  
  // По умолчанию - седан (легковая)
  return 'sedan';
}
