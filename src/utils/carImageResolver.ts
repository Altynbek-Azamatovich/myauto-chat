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

// Импорт изображений кроссоверов (8 цветов, остальные будут добавлены)
import белыйКроссовер from '@/assets/cars/crossover/белый-кроссовер.png';
import желтыйКроссовер from '@/assets/cars/crossover/желтый-кроссовер.png';
import зеленыйКроссовер from '@/assets/cars/crossover/зеленый-кроссовер.png';
import золотистыйКроссовер from '@/assets/cars/crossover/золотистый-кроссовер.png';
import коричневыйКроссовер from '@/assets/cars/crossover/коричневый-кроссовер.png';
import красныйКроссовер from '@/assets/cars/crossover/красный-кроссовер.png';
import оранжевыйКроссовер from '@/assets/cars/crossover/оранжевый-кроссовер.png';
import розовыйКроссовер from '@/assets/cars/crossover/розовый-кроссовер.png';

// Типы кузовов
export type BodyType = 'sedan' | 'crossover' | 'suv' | 'minivan';

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
  
  // Дефолт для "Другой цвет"
  'Другой цвет (указать вручную)': 'серый',
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

// Изображения кроссоверов по цветам (8 цветов, остальные fallback на седаны)
const crossoverImages: Record<string, string> = {
  'белый': белыйКроссовер,
  'желтый': желтыйКроссовер,
  'зеленый': зеленыйКроссовер,
  'золотистый': золотистыйКроссовер,
  'коричневый': коричневыйКроссовер,
  'красный': красныйКроссовер,
  'оранжевый': оранжевыйКроссовер,
  'розовый': розовыйКроссовер,
  // TODO: Добавить когда будут загружены
  'серый': серыйСедан,      // fallback на седан
  'синий': синийСедан,      // fallback на седан
  'фиолетовый': фиолетовыйСедан, // fallback на седан
  'черный': черныйСедан,    // fallback на седан
};

// Изображения по типам кузова
const bodyTypeImages: Record<BodyType, Record<string, string>> = {
  sedan: sedanImages,
  crossover: crossoverImages,
  suv: sedanImages,       // TODO: заменить на внедорожники
  minivan: sedanImages,   // TODO: заменить на минивены
};

// Дефолтное изображение (серый седан)
const defaultCarImage = серыйСедан;

/**
 * Получить изображение машины по цвету и типу кузова
 * @param color - Цвет из базы данных (например "Белый", "Темно-синий")
 * @param bodyType - Тип кузова (sedan, crossover, suv, minivan)
 * @returns URL изображения
 */
export function getCarImage(color?: string | null, bodyType: BodyType = 'sedan'): string {
  if (!color) {
    return defaultCarImage;
  }
  
  // Получаем нормализованное имя цвета
  const normalizedColor = colorMapping[color] || 'серый';
  
  // Получаем изображения для типа кузова
  const images = bodyTypeImages[bodyType] || sedanImages;
  
  // Возвращаем изображение или дефолт
  return images[normalizedColor] || defaultCarImage;
}

/**
 * Определить тип кузова по модели автомобиля
 * Пока все считаются легковыми (седан)
 */
export function getBodyTypeFromModel(brandName?: string, model?: string): BodyType {
  // TODO: В будущем можно добавить логику определения типа кузова
  // по марке и модели (например Toyota RAV4 → crossover)
  return 'sedan';
}

export { defaultCarImage };
