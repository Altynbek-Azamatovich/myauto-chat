// Импорт всех изображений седанов (12 цветов)
import белыйСедан from '@/assets/cars/sedan/белый-седан.png';
import желтыйСедан from '@/assets/cars/sedan/желтый-седан.png';
import зеленыйСедан from '@/assets/cars/sedan/зеленый-седан.png';
import золотистыйСедан from '@/assets/cars/sedan/золотистый-седан.png';
import коричневыйСедан from '@/assets/cars/sedan/коричневый-седан.png';
import красныйСедан from '@/assets/cars/sedan/красный-седан.png';
import оранжевыйСедан from '@/assets/cars/sedan/оранжевый-седан.png';
import розовыйСедан from '@/assets/cars/sedan/розовый-седан.png';
import серыйСедан from '@/assets/cars/sedan/серый-седан.png';
import синийСедан from '@/assets/cars/sedan/синий-седан.png';
import фиолетовыйСедан from '@/assets/cars/sedan/фиолетовый-седан.png';
import черныйСедан from '@/assets/cars/sedan/черный-седан.png';

// Импорт изображений кроссоверов (12 цветов)
import белыйКроссовер from '@/assets/cars/crossover/белый-кроссовер.png';
import желтыйКроссовер from '@/assets/cars/crossover/желтый-кроссовер.png';
import зеленыйКроссовер from '@/assets/cars/crossover/зеленый-кроссовер.png';
import золотистыйКроссовер from '@/assets/cars/crossover/золотистый-кроссовер.png';
import коричневыйКроссовер from '@/assets/cars/crossover/коричневый-кроссовер.png';
import красныйКроссовер from '@/assets/cars/crossover/красный-кроссовер.png';
import оранжевыйКроссовер from '@/assets/cars/crossover/оранжевый-кроссовер.png';
import розовыйКроссовер from '@/assets/cars/crossover/розовый-кроссовер.png';
import серыйКроссовер from '@/assets/cars/crossover/серый-кроссовер.png';
import синийКроссовер from '@/assets/cars/crossover/синий-кроссовер.png';
import фиолетовыйКроссовер from '@/assets/cars/crossover/фиолетовый-кроссовер.png';
import черныйКроссовер from '@/assets/cars/crossover/черный-кроссовер.png';

// Импорт изображений внедорожников (12 цветов)
import белыйВнедорожник from '@/assets/cars/suv/белый-внедорожник.png';
import желтыйВнедорожник from '@/assets/cars/suv/желтый-внедорожник.png';
import зеленыйВнедорожник from '@/assets/cars/suv/зеленый-внедорожник.png';
import золотистыйВнедорожник from '@/assets/cars/suv/золотистый-внедорожник.png';
import коричневыйВнедорожник from '@/assets/cars/suv/коричневый-внедорожник.png';
import красныйВнедорожник from '@/assets/cars/suv/красный-внедорожник.png';
import оранжевыйВнедорожник from '@/assets/cars/suv/оранжевый-внедорожник.png';
import розовыйВнедорожник from '@/assets/cars/suv/розовый-внедорожник.png';
import серыйВнедорожник from '@/assets/cars/suv/серый-внедорожник.png';
import синийВнедорожник from '@/assets/cars/suv/синий-внедорожник.png';
import фиолетовыйВнедорожник from '@/assets/cars/suv/фиолетовый-внедорожник.png';
import черныйВнедорожник from '@/assets/cars/suv/черный-внедорожник.png';

// Импорт изображений минивенов (12 цветов - полный набор)
import белыйМинивен from '@/assets/cars/minivan/белый-минивен.png';
import желтыйМинивен from '@/assets/cars/minivan/желтый-минивен.png';
import зеленыйМинивен from '@/assets/cars/minivan/зеленый-минивен.png';
import золотистыйМинивен from '@/assets/cars/minivan/золотистый-минивен.png';
import коричневыйМинивен from '@/assets/cars/minivan/коричневый-минивен.png';
import красныйМинивен from '@/assets/cars/minivan/красный-минивен.png';
import оранжевыйМинивен from '@/assets/cars/minivan/оранжевый-минивен.png';
import розовыйМинивен from '@/assets/cars/minivan/розовый-минивен.png';
import серыйМинивен from '@/assets/cars/minivan/серый-минивен.png';
import синийМинивен from '@/assets/cars/minivan/синий-минивен.png';
import фиолетовыйМинивен from '@/assets/cars/minivan/фиолетовый-минивен.png';
import черныйМинивен from '@/assets/cars/minivan/черный-минивен.png';

// Импорт типа и функции определения кузова
import { type BodyType, getBodyTypeFromModel } from '@/data/car-body-types';
export { type BodyType, getBodyTypeFromModel };

// Дефолтный цвет если не найден
const DEFAULT_COLOR = 'черный';

// Маппинг цветов из базы данных к имени файла изображения
const colorMapping: Record<string, string> = {
  // Белый
  'Белый': 'белый',
  
  // Жёлтый группа (бежевый → желтый)
  'Желтый': 'желтый',
  'Бежевый': 'желтый',
  
  // Синий группа (голубой, синий, темно-синий → синий)
  'Синий': 'синий',
  'Голубой': 'синий',
  'Темно-синий': 'синий',
  
  // Зелёный группа (зеленый, темно-зеленый → зеленый)
  'Зеленый': 'зеленый',
  'Темно-зеленый': 'зеленый',
  
  // Серый группа (серый, светло-серый, темно-серый, серебристый → серый)
  'Серый': 'серый',
  'Светло-серый': 'серый',
  'Темно-серый': 'серый',
  'Серебристый': 'серый',
  
  // Красный группа (красный, бордовый → красный)
  'Красный': 'красный',
  'Бордовый': 'красный',
  
  // Остальные цвета 1:1
  'Золотистый': 'золотистый',
  'Коричневый': 'коричневый',
  'Оранжевый': 'оранжевый',
  'Розовый': 'розовый',
  'Черный': 'черный',
  'Фиолетовый': 'фиолетовый',
};

// Изображения седанов по цветам (все 12 цветов)
const sedanImages: Record<string, string> = {
  'белый': белыйСедан,
  'желтый': желтыйСедан,
  'зеленый': зеленыйСедан,
  'золотистый': золотистыйСедан,
  'коричневый': коричневыйСедан,
  'красный': красныйСедан,
  'оранжевый': оранжевыйСедан,
  'розовый': розовыйСедан,
  'серый': серыйСедан,
  'синий': синийСедан,
  'фиолетовый': фиолетовыйСедан,
  'черный': черныйСедан,
};

// Изображения кроссоверов по цветам (все 12 цветов)
const crossoverImages: Record<string, string> = {
  'белый': белыйКроссовер,
  'желтый': желтыйКроссовер,
  'зеленый': зеленыйКроссовер,
  'золотистый': золотистыйКроссовер,
  'коричневый': коричневыйКроссовер,
  'красный': красныйКроссовер,
  'оранжевый': оранжевыйКроссовер,
  'розовый': розовыйКроссовер,
  'серый': серыйКроссовер,
  'синий': синийКроссовер,
  'фиолетовый': фиолетовыйКроссовер,
  'черный': черныйКроссовер,
};

// Изображения внедорожников по цветам (все 12 цветов)
const suvImages: Record<string, string> = {
  'белый': белыйВнедорожник,
  'желтый': желтыйВнедорожник,
  'зеленый': зеленыйВнедорожник,
  'золотистый': золотистыйВнедорожник,
  'коричневый': коричневыйВнедорожник,
  'красный': красныйВнедорожник,
  'оранжевый': оранжевыйВнедорожник,
  'розовый': розовыйВнедорожник,
  'серый': серыйВнедорожник,
  'синий': синийВнедорожник,
  'фиолетовый': фиолетовыйВнедорожник,
  'черный': черныйВнедорожник,
};

// Изображения минивенов по цветам (все 12 цветов)
const minivanImages: Record<string, string> = {
  'белый': белыйМинивен,
  'желтый': желтыйМинивен,
  'зеленый': зеленыйМинивен,
  'золотистый': золотистыйМинивен,
  'коричневый': коричневыйМинивен,
  'красный': красныйМинивен,
  'оранжевый': оранжевыйМинивен,
  'розовый': розовыйМинивен,
  'серый': серыйМинивен,
  'синий': синийМинивен,
  'фиолетовый': фиолетовыйМинивен,
  'черный': черныйМинивен,
};

// Изображения по типам кузова
const bodyTypeImages: Record<BodyType, Record<string, string>> = {
  sedan: sedanImages,
  crossover: crossoverImages,
  suv: suvImages,
  minivan: minivanImages,
};

// Дефолтное изображение (чёрный седан)
const defaultCarImage = черныйСедан;

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
