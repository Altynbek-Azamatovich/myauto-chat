import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ru' | 'kk';

interface Translations {
  [key: string]: {
    ru: string;
    kk: string;
  };
}

const translations: Translations = {
  // Welcome Screen
  welcome: { ru: 'Добро пожаловать', kk: 'Қош келдіңіз' },
  getStarted: { ru: 'Начнем', kk: 'Бастайық' },
  
  // Phone Auth
  phoneAuth: { ru: 'Добро пожаловать', kk: 'Қош келдіңіз' },
  enterPhone: { ru: 'Для авторизации, введите свой номер телефона', kk: 'Авторизация үшін телефон нөміріңізді енгізіңіз' },
  agree: { ru: 'Я согласен с условиями', kk: 'Мен келісемін' },
  userAgreement: { ru: 'пользовательского соглашения', kk: 'пайдаланушы келісіміне' },
  next: { ru: 'Далее', kk: 'Келесі' },
  
  // OTP Verify
  enterOTP: { ru: 'Ввод пароля', kk: 'Құпия сөзді енгізу' },
  enterCode: { ru: 'Введите пароль из 6 цифр', kk: '6 таңбалы құпия сөзді енгізіңіз' },
  resendCode: { ru: 'Отправить код повторно', kk: 'Кодты қайта жіберу' },
  availableIn: { ru: 'Будет доступно через', kk: 'Қолжетімді болады' },
  
  // Profile Setup
  profileSetup: { ru: 'Заполнение профиля', kk: 'Профильді толтыру' },
  city: { ru: 'Город', kk: 'Қала' },
  firstName: { ru: 'Имя', kk: 'Аты' },
  lastName: { ru: 'Фамилия', kk: 'Тегі' },
  patronymic: { ru: 'Отчество (необязательно)', kk: 'Әкесінің аты (міндетті емес)' },
  carBrand: { ru: 'Марка авто', kk: 'Автомобиль маркасы' },
  carModel: { ru: 'Модель авто', kk: 'Автомобиль үлгісі' },
  licensePlate: { ru: 'Гос номер', kk: 'Мемлекеттік нөмір' },
  carColor: { ru: 'Цвет', kk: 'Түсі' },
  carYear: { ru: 'Год', kk: 'Жылы' },
  complete: { ru: 'Завершить', kk: 'Аяқтау' },
  
  // Common
  back: { ru: 'Назад', kk: 'Артқа' },
  cancel: { ru: 'Отмена', kk: 'Болдырмау' },
  save: { ru: 'Сохранить', kk: 'Сақтау' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'ru' || saved === 'kk')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
