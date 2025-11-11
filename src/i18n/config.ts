import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
      },
      menu: {
        dashboard: 'Панель',
        orders: 'Заказы',
        clients: 'Клиенты',
        services: 'Услуги',
        analytics: 'Аналитика',
        shifts: 'Смены',
        settings: 'Настройки',
        logout: 'Выход',
      },
      orders: {
        title: 'Заказы',
        subtitle: 'Управление заказами',
        new: 'Новый заказ',
        updated: 'Заказ обновлен',
        created: 'Заказ создан',
      },
      clients: {
        title: 'Клиенты',
        subtitle: 'База клиентов',
        create: 'Добавить клиента',
        edit: 'Редактировать клиента',
        created: 'Клиент добавлен',
        updated: 'Клиент обновлен',
        validation: {
          required: 'Заполните обязательные поля',
        },
      },
      services: {
        title: 'Услуги',
        subtitle: 'Каталог услуг',
        create: 'Добавить услугу',
        edit: 'Редактировать услугу',
        created: 'Услуга добавлена',
        updated: 'Услуга обновлена',
        validation: {
          required: 'Заполните обязательные поля',
        },
      },
      settings: {
        save: 'Настройки сохранены',
      },
      app: {
        subtitle: 'Система управления',
      },
    },
  },
  kk: {
    translation: {
      common: {
        loading: 'Жүктелуде...',
        error: 'Қате',
        save: 'Сақтау',
        cancel: 'Болдырмау',
        delete: 'Жою',
        edit: 'Өңдеу',
      },
      menu: {
        dashboard: 'Панель',
        orders: 'Тапсырыстар',
        clients: 'Клиенттер',
        services: 'Қызметтер',
        analytics: 'Аналитика',
        shifts: 'Смен',
        settings: 'Баптаулар',
        logout: 'Шығу',
      },
      orders: {
        title: 'Тапсырыстар',
        subtitle: 'Тапсырыстарды басқару',
        new: 'Жаңа тапсырыс',
        updated: 'Тапсырыс жаңартылды',
        created: 'Тапсырыс жасалды',
      },
      clients: {
        title: 'Клиенттер',
        subtitle: 'Клиенттер базасы',
        create: 'Клиент қосу',
        edit: 'Клиентті өңдеу',
        created: 'Клиент қосылды',
        updated: 'Клиент жаңартылды',
        validation: {
          required: 'Міндетті өрістерді толтырыңыз',
        },
      },
      services: {
        title: 'Қызметтер',
        subtitle: 'Қызметтер каталогы',
        create: 'Қызмет қосу',
        edit: 'Қызметті өңдеу',
        created: 'Қызмет қосылды',
        updated: 'Қызмет жаңартылды',
        validation: {
          required: 'Міндетті өрістерді толтырыңыз',
        },
      },
      settings: {
        save: 'Баптаулар сақталды',
      },
      app: {
        subtitle: 'Басқару жүйесі',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
