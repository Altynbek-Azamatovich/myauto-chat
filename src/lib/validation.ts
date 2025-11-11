import { z } from 'zod';

// Phone number validation
export const phoneSchema = z.string()
  .min(10, 'Номер телефона должен содержать минимум 10 цифр')
  .max(15, 'Номер телефона не должен превышать 15 цифр')
  .regex(/^\+?[0-9]+$/, 'Номер телефона должен содержать только цифры');

// Email validation
export const emailSchema = z.string()
  .email('Неверный формат email')
  .max(255, 'Email не должен превышать 255 символов');

// Name validation
export const nameSchema = z.string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя не должно превышать 50 символов')
  .regex(/^[а-яА-ЯёЁa-zA-Z\s-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

// License plate validation (Kazakhstan format)
export const licensePlateSchema = z.string()
  .min(6, 'Номер должен содержать минимум 6 символов')
  .max(10, 'Номер не должен превышать 10 символов')
  .regex(/^[0-9]{3}[А-Я]{3}[0-9]{2}$|^[А-Я]{1}[0-9]{3}[А-Я]{2}[0-9]{2}$/, 'Неверный формат номера');

// VIN validation
export const vinSchema = z.string()
  .length(17, 'VIN номер должен содержать 17 символов')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Неверный формат VIN');

// Profile setup form
export const profileSetupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  patronymic: nameSchema.optional(),
  phoneNumber: phoneSchema,
  city: z.string().min(1, 'Выберите город'),
  preferredLanguage: z.enum(['ru', 'kk']),
});

// Vehicle form
export const vehicleSchema = z.object({
  brandId: z.string().uuid('Выберите марку автомобиля'),
  model: z.string().min(1, 'Укажите модель').max(50, 'Модель не должна превышать 50 символов'),
  year: z.number()
    .min(1900, 'Год должен быть больше 1900')
    .max(new Date().getFullYear() + 1, 'Год не может быть в будущем'),
  licensePlate: licensePlateSchema.optional(),
  vin: vinSchema.optional(),
  color: z.string().min(1, 'Выберите цвет'),
  mileage: z.number().min(0, 'Пробег не может быть отрицательным'),
});

// Service request form
export const serviceRequestSchema = z.object({
  vehicleId: z.string().uuid('Выберите автомобиль'),
  partnerId: z.string().uuid('Выберите сервис'),
  serviceType: z.enum(['maintenance', 'repair', 'diagnostic', 'detailing', 'wash']),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов').max(500, 'Описание не должно превышать 500 символов'),
  preferredDate: z.date().optional(),
  preferredTime: z.string().optional(),
});

// Review form
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Поставьте оценку').max(5, 'Максимальная оценка - 5'),
  comment: z.string().max(500, 'Комментарий не должен превышать 500 символов').optional(),
});

// Partner service form
export const partnerServiceSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа').max(100, 'Название не должно превышать 100 символов'),
  category: z.string().min(1, 'Выберите категорию'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  durationMinutes: z.number().min(1, 'Укажите длительность').optional(),
});

// OTP validation
export const otpSchema = z.string()
  .length(6, 'Код должен содержать 6 цифр')
  .regex(/^[0-9]+$/, 'Код должен содержать только цифры');

// Price validation
export const priceSchema = z.number()
  .min(0, 'Цена не может быть отрицательной')
  .max(10000000, 'Цена слишком велика');

// Mileage validation
export const mileageSchema = z.number()
  .min(0, 'Пробег не может быть отрицательным')
  .max(10000000, 'Пробег слишком велик');
