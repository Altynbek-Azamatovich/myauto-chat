// Импорт всех изображений седанов
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
  
  // TODO: Добавить когда будут загружены
  'Черный': 'черный',
  'Фиолетовый': 'фиолетовый',
  
  // Дефолт для "Другой цвет"
  'Другой цвет (указать вручную)': 'серый',
};

// Изображения седанов по цветам
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
  // TODO: Добавить черный и фиолетовый когда будут загружены
};

// Изображения по типам кузова (пока только седаны)
const bodyTypeImages: Record<BodyType, Record<string, string>> = {
  sedan: sedanImages,
  crossover: sedanImages, // TODO: заменить на кроссоверы
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
