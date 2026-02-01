// Импорт всех изображений седанов (12 цветов)
import whiteSedanImg from '@/assets/cars/sedan/white-sedan.png';
import yellowSedanImg from '@/assets/cars/sedan/yellow-sedan.png';
import greenSedanImg from '@/assets/cars/sedan/green-sedan.png';
import goldSedanImg from '@/assets/cars/sedan/gold-sedan.png';
import brownSedanImg from '@/assets/cars/sedan/brown-sedan.png';
import redSedanImg from '@/assets/cars/sedan/red-sedan.png';
import orangeSedanImg from '@/assets/cars/sedan/orange-sedan.png';
import pinkSedanImg from '@/assets/cars/sedan/pink-sedan.png';
import graySedanImg from '@/assets/cars/sedan/gray-sedan.png';
import blueSedanImg from '@/assets/cars/sedan/blue-sedan.png';
import purpleSedanImg from '@/assets/cars/sedan/purple-sedan.png';
import blackSedanImg from '@/assets/cars/sedan/black-sedan.png';

// Импорт изображений кроссоверов (12 цветов)
import whiteCrossoverImg from '@/assets/cars/crossover/white-crossover.png';
import yellowCrossoverImg from '@/assets/cars/crossover/yellow-crossover.png';
import greenCrossoverImg from '@/assets/cars/crossover/green-crossover.png';
import goldCrossoverImg from '@/assets/cars/crossover/gold-crossover.png';
import brownCrossoverImg from '@/assets/cars/crossover/brown-crossover.png';
import redCrossoverImg from '@/assets/cars/crossover/red-crossover.png';
import orangeCrossoverImg from '@/assets/cars/crossover/orange-crossover.png';
import pinkCrossoverImg from '@/assets/cars/crossover/pink-crossover.png';
import grayCrossoverImg from '@/assets/cars/crossover/gray-crossover.png';
import blueCrossoverImg from '@/assets/cars/crossover/blue-crossover.png';
import purpleCrossoverImg from '@/assets/cars/crossover/purple-crossover.png';
import blackCrossoverImg from '@/assets/cars/crossover/black-crossover.png';

// Импорт изображений внедорожников (12 цветов)
import whiteSuvImg from '@/assets/cars/suv/white-suv.png';
import yellowSuvImg from '@/assets/cars/suv/yellow-suv.png';
import greenSuvImg from '@/assets/cars/suv/green-suv.png';
import goldSuvImg from '@/assets/cars/suv/gold-suv.png';
import brownSuvImg from '@/assets/cars/suv/brown-suv.png';
import redSuvImg from '@/assets/cars/suv/red-suv.png';
import orangeSuvImg from '@/assets/cars/suv/orange-suv.png';
import pinkSuvImg from '@/assets/cars/suv/pink-suv.png';
import graySuvImg from '@/assets/cars/suv/gray-suv.png';
import blueSuvImg from '@/assets/cars/suv/blue-suv.png';
import purpleSuvImg from '@/assets/cars/suv/purple-suv.png';
import blackSuvImg from '@/assets/cars/suv/black-suv.png';

// Импорт изображений минивенов (12 цветов)
import whiteMinivanImg from '@/assets/cars/minivan/white-minivan.png';
import yellowMinivanImg from '@/assets/cars/minivan/yellow-minivan.png';
import greenMinivanImg from '@/assets/cars/minivan/green-minivan.png';
import goldMinivanImg from '@/assets/cars/minivan/gold-minivan.png';
import brownMinivanImg from '@/assets/cars/minivan/brown-minivan.png';
import redMinivanImg from '@/assets/cars/minivan/red-minivan.png';
import orangeMinivanImg from '@/assets/cars/minivan/orange-minivan.png';
import pinkMinivanImg from '@/assets/cars/minivan/pink-minivan.png';
import grayMinivanImg from '@/assets/cars/minivan/gray-minivan.png';
import blueMinivanImg from '@/assets/cars/minivan/blue-minivan.png';
import purpleMinivanImg from '@/assets/cars/minivan/purple-minivan.png';
import blackMinivanImg from '@/assets/cars/minivan/black-minivan.png';

// Импорт типа и функции определения кузова
import { type BodyType, getBodyTypeFromModel } from '@/data/car-body-types';
export { type BodyType, getBodyTypeFromModel };

// Дефолтный цвет если не найден
const DEFAULT_COLOR = 'black';

// Маппинг цветов из базы данных к внутреннему ключу
const colorMapping: Record<string, string> = {
  // Белый
  'Белый': 'white',
  
  // Жёлтый группа (бежевый → желтый)
  'Желтый': 'yellow',
  'Бежевый': 'yellow',
  
  // Синий группа (голубой, синий, темно-синий → синий)
  'Синий': 'blue',
  'Голубой': 'blue',
  'Темно-синий': 'blue',
  
  // Зелёный группа (зеленый, темно-зеленый → зеленый)
  'Зеленый': 'green',
  'Темно-зеленый': 'green',
  
  // Серый группа (серый, светло-серый, темно-серый, серебристый → серый)
  'Серый': 'gray',
  'Светло-серый': 'gray',
  'Темно-серый': 'gray',
  'Серебристый': 'gray',
  
  // Красный группа (красный, бордовый → красный)
  'Красный': 'red',
  'Бордовый': 'red',
  
  // Остальные цвета 1:1
  'Золотистый': 'gold',
  'Коричневый': 'brown',
  'Оранжевый': 'orange',
  'Розовый': 'pink',
  'Черный': 'black',
  'Фиолетовый': 'purple',
};

// Изображения седанов по цветам (все 12 цветов)
const sedanImages: Record<string, string> = {
  'white': whiteSedanImg,
  'yellow': yellowSedanImg,
  'green': greenSedanImg,
  'gold': goldSedanImg,
  'brown': brownSedanImg,
  'red': redSedanImg,
  'orange': orangeSedanImg,
  'pink': pinkSedanImg,
  'gray': graySedanImg,
  'blue': blueSedanImg,
  'purple': purpleSedanImg,
  'black': blackSedanImg,
};

// Изображения кроссоверов по цветам (все 12 цветов)
const crossoverImages: Record<string, string> = {
  'white': whiteCrossoverImg,
  'yellow': yellowCrossoverImg,
  'green': greenCrossoverImg,
  'gold': goldCrossoverImg,
  'brown': brownCrossoverImg,
  'red': redCrossoverImg,
  'orange': orangeCrossoverImg,
  'pink': pinkCrossoverImg,
  'gray': grayCrossoverImg,
  'blue': blueCrossoverImg,
  'purple': purpleCrossoverImg,
  'black': blackCrossoverImg,
};

// Изображения внедорожников по цветам (все 12 цветов)
const suvImages: Record<string, string> = {
  'white': whiteSuvImg,
  'yellow': yellowSuvImg,
  'green': greenSuvImg,
  'gold': goldSuvImg,
  'brown': brownSuvImg,
  'red': redSuvImg,
  'orange': orangeSuvImg,
  'pink': pinkSuvImg,
  'gray': graySuvImg,
  'blue': blueSuvImg,
  'purple': purpleSuvImg,
  'black': blackSuvImg,
};

// Изображения минивенов по цветам (все 12 цветов)
const minivanImages: Record<string, string> = {
  'white': whiteMinivanImg,
  'yellow': yellowMinivanImg,
  'green': greenMinivanImg,
  'gold': goldMinivanImg,
  'brown': brownMinivanImg,
  'red': redMinivanImg,
  'orange': orangeMinivanImg,
  'pink': pinkMinivanImg,
  'gray': grayMinivanImg,
  'blue': blueMinivanImg,
  'purple': purpleMinivanImg,
  'black': blackMinivanImg,
};

// Изображения по типам кузова
const bodyTypeImages: Record<BodyType, Record<string, string>> = {
  sedan: sedanImages,
  crossover: crossoverImages,
  suv: suvImages,
  minivan: minivanImages,
};

// Дефолтное изображение (чёрный седан)
const defaultCarImage = blackSedanImg;

/**
 * Получить изображение машины по цвету и типу кузова
 * @param color - Цвет из базы данных (например "Белый", "Темно-синий")
 * @param bodyType - Тип кузова (sedan, crossover, suv, minivan)
 * @returns URL изображения
 */
export function getCarImage(color?: string | null, bodyType: BodyType = 'sedan'): string {
  // Получаем нормализованное имя цвета (дефолт: чёрный)
  const normalizedColor = color ? (colorMapping[color] || DEFAULT_COLOR) : DEFAULT_COLOR;
  
  // Получаем изображения для типа кузова
  const images = bodyTypeImages[bodyType] || sedanImages;
  
  // Возвращаем изображение или дефолт (чёрный седан)
  return images[normalizedColor] || defaultCarImage;
}

export { defaultCarImage };
