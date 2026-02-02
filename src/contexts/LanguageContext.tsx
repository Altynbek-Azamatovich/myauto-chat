import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ru' | 'kk' | 'en';

interface Translations {
  [key: string]: {
    ru: string;
    kk: string;
    en: string;
  };
}

const translations: Translations = {
  // Welcome Screen
  welcome: { ru: 'Добро пожаловать', kk: 'Қош келдіңіз', en: 'Welcome' },
  getStarted: { ru: 'Начнем', kk: 'Бастайық', en: 'Get Started' },
  
  // Phone Auth
  phoneAuth: { ru: 'Добро пожаловать', kk: 'Қош келдіңіз', en: 'Welcome' },
  welcomeTitle: { ru: 'Добро пожаловать!', kk: 'Қош келдіңіз!', en: 'Welcome!' },
  enterPhoneForAuth: { ru: 'Введите свой номер телефона для входа или регистрации', kk: 'Кіру немесе тіркелу үшін телефон нөміріңізді енгізіңіз', en: 'Enter your phone number to sign in or register' },
  enterPhoneTitle: { ru: 'Введите свой номер телефона', kk: 'Телефон нөміріңізді енгізіңіз', en: 'Enter your phone number' },
  forLoginOrRegister: { ru: 'для входа или регистрации', kk: 'кіру немесе тіркелу үшін', en: 'to sign in or register' },
  enterPhone: { ru: 'Для авторизации, введите свой номер телефона', kk: 'Авторизация үшін телефон нөміріңізді енгізіңіз', en: 'Enter your phone number to authorize' },
  byClickingNext: { ru: 'Нажимая кнопку "Далее" Вы соглашаетесь с', kk: '"Келесі" түймесін басу арқылы сіз келісесіз', en: 'By clicking "Next" you agree to' },
  byClickingNextLine1: { ru: 'Нажимая кнопку "Далее"', kk: '"Келесі" түймесін басу арқылы', en: 'By clicking "Next"' },
  byClickingNextLine2: { ru: 'Вы соглашаетесь с', kk: 'сіз келісесіз', en: 'you agree to' },
  publicOffer: { ru: 'Публичной офертой', kk: 'Жария офертамен', en: 'Public Offer' },
  password: { ru: 'Пароль', kk: 'Құпия сөз', en: 'Password' },
  confirmPassword: { ru: 'Подтвердите пароль', kk: 'Құпия сөзді растаңыз', en: 'Confirm password' },
  showPassword: { ru: 'Показать пароль', kk: 'Құпия сөзді көрсету', en: 'Show password' },
  login: { ru: 'Войти', kk: 'Кіру', en: 'Sign In' },
  register: { ru: 'Регистрация', kk: 'Тіркелу', en: 'Register' },
  forgotPassword: { ru: 'Забыли пароль?', kk: 'Құпия сөзді ұмыттыңыз ба?', en: 'Forgot password?' },
  passwordRecovery: { ru: 'Восстановление пароля', kk: 'Құпия сөзді қалпына келтіру', en: 'Password Recovery' },
  send: { ru: 'Отправить', kk: 'Жіберу', en: 'Send' },
  smsSent: { ru: 'SMS отправлено', kk: 'SMS жіберілді', en: 'SMS sent' },
  smsSentDescription: { ru: 'Код подтверждения отправлен на ваш номер', kk: 'Растау коды нөміріңізге жіберілді', en: 'Verification code sent to your number' },
  smsError: { ru: 'Не удалось отправить SMS', kk: 'SMS жіберу мүмкін болмады', en: 'Failed to send SMS' },
  noAccount: { ru: 'Нет аккаунта?', kk: 'Аккаунт жоқ па?', en: 'No account?' },
  haveAccount: { ru: 'Уже есть аккаунт?', kk: 'Аккаунт бар ма?', en: 'Already have an account?' },
  passwordTooShort: { ru: 'Пароль должен быть не менее 6 символов', kk: 'Құпия сөз кемінде 6 таңбадан тұруы керек', en: 'Password must be at least 6 characters' },
  passwordNeedsNumber: { ru: 'Пароль должен содержать хотя бы одну цифру', kk: 'Құпия сөзде кемінде бір сан болуы керек', en: 'Password must contain at least one number' },
  passwordsNotMatch: { ru: 'Пароли не совпадают', kk: 'Құпия сөздер сәйкес келмейді', en: 'Passwords do not match' },
  agree: { ru: 'Я согласен с условиями', kk: 'Мен келісемін', en: 'I agree to the terms' },
  userAgreement: { ru: 'пользовательского соглашения', kk: 'пайдаланушы келісіміне', en: 'user agreement' },
  next: { ru: 'Далее', kk: 'Келесі', en: 'Next' },
  
  // Partner access
  partnerLogin: { ru: "Вход для партнеров", kk: "Серіктестер үшін кіру", en: "Partner Login" },
  enterPartnerCredentials: { ru: "Введите номер телефона и пароль партнера", kk: "Серіктес телефон нөмірі мен құпия сөзін енгізіңіз", en: "Enter partner phone and password" },
  getPartnerAccess: { ru: "Получить доступ к партнерской программе", kk: "Серіктестік бағдарламасына қол жеткізу", en: "Get partner access" },
  partnerAccessDenied: { ru: "У вас нет доступа к партнерской программе", kk: "Сізде серіктестік бағдарламасына қол жеткізу жоқ", en: "No partner access" },
  invalidPartnerCredentials: { ru: "Неверный номер телефона или пароль партнера", kk: "Серіктес телефон нөмірі немесе құпия сөзі қате", en: "Invalid partner credentials" },
  invalidCredentials: { ru: "Неверный номер телефона или пароль", kk: "Телефон нөмірі немесе құпия сөз қате", en: "Invalid credentials" },
  phoneAlreadyRegistered: { ru: "Этот номер уже зарегистрирован. Попробуйте войти.", kk: "Бұл нөмір тіркелген. Кіруге тырысыңыз.", en: "This number is already registered. Try signing in." },
  
  // Partner application
  partnerApplicationTitle: { ru: "Заявка на партнерство", kk: "Серіктестікке өтініш", en: "Partnership Application" },
  partnerApplicationSubtitle: { ru: "Оставьте заявку на подключение к партнерской программе", kk: "Серіктестік бағдарламасына қосылу үшін өтініш қалдырыңыз", en: "Apply to join our partner program" },
  phoneNumber: { ru: "Номер телефона", kk: "Телефон нөмірі", en: "Phone Number" },
  fullName: { ru: "Полное имя", kk: "Толық аты-жөні", en: "Full Name" },
  fullNamePlaceholder: { ru: "Иванов Иван Иванович", kk: "Иванов Иван Иванович", en: "John Doe" },
  fullNameShort: { ru: 'ФИО', kk: 'ТАӘ', en: 'Full Name' },
  fullNameRequired: { ru: "Введите полное имя", kk: "Толық аты-жөніңізді енгізіңіз", en: "Enter your full name" },
  businessName: { ru: "Название бизнеса", kk: "Бизнес атауы", en: "Business Name" },
  businessNamePlaceholder: { ru: "Название вашего автосервиса или магазина", kk: "Автосервис немесе дүкеніңіздің атауы", en: "Your auto service or shop name" },
  businessDescription: { ru: "Описание бизнеса", kk: "Бизнес сипаттамасы", en: "Business Description" },
  businessDescriptionPlaceholder: { ru: "Расскажите о вашем бизнесе, услугах и опыте работы", kk: "Бизнесіңіз, қызметтеріңіз және жұмыс тәжірибеңіз туралы айтып беріңіз", en: "Tell us about your business, services and experience" },
  businessDescriptionRequired: { ru: "Введите описание бизнеса", kk: "Бизнес сипаттамасын енгізіңіз", en: "Enter business description" },
  cityPlaceholder: { ru: "Алматы", kk: "Алматы", en: "Almaty" },
  selectCity: { ru: 'Выберите город', kk: 'Қаланы таңдаңыз', en: 'Select city' },
  submitApplication: { ru: "Отправить заявку", kk: "Өтінішті жіберу", en: "Submit Application" },
  applicationSubmitted: { ru: "Заявка отправлена! Мы свяжемся с вами в течение 1-2 рабочих дней.", kk: "Өтініш жіберілді! Біз сізбен 1-2 жұмыс күні ішінде байланысамыз.", en: "Application submitted! We'll contact you within 1-2 business days." },
  applicationError: { ru: "Ошибка при отправке заявки", kk: "Өтінішті жіберу кезінде қате", en: "Error submitting application" },
  applicationProcessInfo: { ru: "* Мы свяжемся с вами для проверки и выдачи пароля", kk: "* Біз тексеру және құпия сөз беру үшін сізбен байланысамыз", en: "* We'll contact you for verification and password" },
  
  partnerPin: { ru: 'PIN-код партнера', kk: 'Серіктес PIN-коды', en: 'Partner PIN' },
  enterPartnerPin: { ru: 'Введите PIN-код партнера (4-6 цифр)', kk: 'Серіктес PIN-кодын енгізіңіз (4-6 сан)', en: 'Enter partner PIN (4-6 digits)' },
  createPartnerPin: { ru: 'Создайте PIN-код партнера (4-6 цифр)', kk: 'Серіктес PIN-кодын жасаңыз (4-6 сан)', en: 'Create partner PIN (4-6 digits)' },
  confirmPartnerPin: { ru: 'Подтвердите PIN-код', kk: 'PIN-кодты растаңыз', en: 'Confirm PIN' },
  pinTooShort: { ru: 'PIN-код должен быть 4-6 цифр', kk: 'PIN-код 4-6 саннан тұруы керек', en: 'PIN must be 4-6 digits' },
  pinNotMatch: { ru: 'PIN-коды не совпадают', kk: 'PIN-кодтар сәйкес келмейді', en: 'PINs do not match' },
  pinInvalid: { ru: 'Неверный PIN-код', kk: 'Қате PIN-код', en: 'Invalid PIN' },
  
  // OTP Verify
  enterOTP: { ru: 'Ввод кода', kk: 'Кодты енгізу', en: 'Enter Code' },
  enterSmsCode: { ru: 'Введите код из СМС', kk: 'СМС кодын енгізіңіз', en: 'Enter SMS code' },
  smsCodeSentTo: { ru: 'Мы отправили смс с кодом на номер', kk: 'Біз код бар смс жібердік', en: 'We sent a code to' },
  enterCode: { ru: 'Введите код из 4 цифр', kk: '4 таңбалы кодты енгізіңіз', en: 'Enter 4-digit code' },
  resendCode: { ru: 'Выслать повторно', kk: 'Қайта жіберу', en: 'Resend code' },
  availableIn: { ru: 'Будет доступно через', kk: 'Қолжетімді болады', en: 'Available in' },
  
  // Profile Setup
  profileSetup: { ru: 'Заполнение профиля', kk: 'Профильді толтыру', en: 'Profile Setup' },
  city: { ru: 'Город', kk: 'Қала', en: 'City' },
  firstName: { ru: 'Имя', kk: 'Аты', en: 'First Name' },
  lastName: { ru: 'Фамилия', kk: 'Тегі', en: 'Last Name' },
  patronymic: { ru: 'Отчество (необязательно)', kk: 'Әкесінің аты (міндетті емес)', en: 'Patronymic (optional)' },
  carBrand: { ru: 'Марка авто', kk: 'Автомобиль маркасы', en: 'Car Brand' },
  carModel: { ru: 'Модель авто', kk: 'Автомобиль үлгісі', en: 'Car Model' },
  licensePlate: { ru: 'Гос номер', kk: 'Мемлекеттік нөмір', en: 'License Plate' },
  carColor: { ru: 'Цвет', kk: 'Түсі', en: 'Color' },
  carYear: { ru: 'Год', kk: 'Жылы', en: 'Year' },
  complete: { ru: 'Завершить', kk: 'Аяқтау', en: 'Complete' },
  
  // Home Page
  settings: { ru: 'Настройки', kk: 'Баптаулар', en: 'Settings' },
  profile: { ru: 'Профиль', kk: 'Профиль', en: 'Profile' },
  appTheme: { ru: 'Тема приложения', kk: 'Қолданба тақырыбы', en: 'App Theme' },
  notificationSettings: { ru: 'Настройки уведомлений', kk: 'Хабарландыру баптаулары', en: 'Notification Settings' },
  language: { ru: 'Язык', kk: 'Тіл', en: 'Language' },
  aboutApp: { ru: 'О приложении', kk: 'Қолданба туралы', en: 'About App' },
  support: { ru: 'Поддержка', kk: 'Қолдау', en: 'Support' },
  myCars: { ru: 'Мои автомобили', kk: 'Менің автомобильдерім', en: 'My Cars' },
  serviceHistory: { ru: 'История сервиса', kk: 'Қызмет тарихы', en: 'Service History' },
  profileSettings: { ru: 'Настройки профиля', kk: 'Профиль баптаулары', en: 'Profile Settings' },
  logout: { ru: 'Выйти', kk: 'Шығу', en: 'Log Out' },
  mileage: { ru: 'Пробег', kk: 'Жүгіріс', en: 'Mileage' },
  oilChange: { ru: 'Замена масла', kk: 'Майды ауыстыру', en: 'Oil Change' },
  insuranceExpires: { ru: 'Страховка истекает', kk: 'Сақтандыру мерзімі', en: 'Insurance Expires' },
  technicalCondition: { ru: 'Техническое состояние', kk: 'Техникалық жағдайы', en: 'Technical Condition' },
  avgConsumption: { ru: 'Средний расход', kk: 'Орташа шығын', en: 'Avg. Consumption' },
  nextService: { ru: 'Следующее ТО', kk: 'Келесі ТО', en: 'Next Service' },
  selectLanguage: { ru: 'Выберите язык', kk: 'Тілді таңдаңыз', en: 'Select Language' },
  russian: { ru: 'Русский', kk: 'Орысша', en: 'Russian' },
  kazakh: { ru: 'Казахский', kk: 'Қазақша', en: 'Kazakh' },
  english: { ru: 'Английский', kk: 'Ағылшынша', en: 'English' },
  
  // Theme
  lightTheme: { ru: 'Светлая', kk: 'Ашық', en: 'Light' },
  darkTheme: { ru: 'Темная', kk: 'Қараңғы', en: 'Dark' },
  
  // Notification Settings
  allNotifications: { ru: 'Все уведомления', kk: 'Барлық хабарландырулар', en: 'All Notifications' },
  allNotificationsDesc: { ru: 'Включить или выключить все уведомления', kk: 'Барлық хабарландыруларды қосу немесе өшіру', en: 'Enable or disable all notifications' },
  notificationTypes: { ru: 'Типы уведомлений', kk: 'Хабарландыру түрлері', en: 'Notification Types' },
  maintenanceReminders: { ru: 'Напоминания о ТО', kk: 'ТҚ туралы еске салғыштар', en: 'Maintenance Reminders' },
  maintenanceRemindersDesc: { ru: 'Напоминания о плановом техобслуживании', kk: 'Жоспарлы техникалық қызмет көрсету туралы еске салғыштар', en: 'Scheduled maintenance reminders' },
  insuranceReminders: { ru: 'Напоминания о страховке', kk: 'Сақтандыру туралы еске салғыштар', en: 'Insurance Reminders' },
  insuranceRemindersDesc: { ru: 'Уведомления о сроках страхования', kk: 'Сақтандыру мерзімдері туралы хабарландырулар', en: 'Insurance expiry notifications' },
  oilChangeReminders: { ru: 'Замена масла', kk: 'Майды ауыстыру', en: 'Oil Change' },
  oilChangeRemindersDesc: { ru: 'Напоминания о замене масла', kk: 'Майды ауыстыру туралы еске салғыштар', en: 'Oil change reminders' },
  newsUpdates: { ru: 'Новости и обновления', kk: 'Жаңалықтар және жаңартулар', en: 'News & Updates' },
  newsUpdatesDesc: { ru: 'Новости приложения и полезные советы', kk: 'Қолданба жаңалықтары және пайдалы кеңестер', en: 'App news and useful tips' },
  notificationBehavior: { ru: 'Поведение уведомлений', kk: 'Хабарландыру әрекеті', en: 'Notification Behavior' },
  sound: { ru: 'Звук', kk: 'Дыбыс', en: 'Sound' },
  soundDesc: { ru: 'Звуковые уведомления', kk: 'Дыбыстық хабарландырулар', en: 'Sound notifications' },
  vibration: { ru: 'Вибрация', kk: 'Діріл', en: 'Vibration' },
  vibrationDesc: { ru: 'Вибрация при уведомлениях', kk: 'Хабарландыру кезінде діріл', en: 'Vibrate on notifications' },
  
  // Photo Diagnostic
  photoDiagnostic: { ru: 'Фотодиагностика', kk: 'Фотодиагностика', en: 'Photo Diagnostic' },
  takePhoto: { ru: 'Сделать фото', kk: 'Фото түсіру', en: 'Take Photo' },
  analyzePhoto: { ru: 'Анализировать фото', kk: 'Фотоны талдау', en: 'Analyze Photo' },
  startCamera: { ru: 'Запустить камеру', kk: 'Камераны іске қосу', en: 'Start Camera' },
  uploadPhoto: { ru: 'Загрузить фото', kk: 'Фото жүктеу', en: 'Upload Photo' },
  retakePhoto: { ru: 'Переснять', kk: 'Қайта түсіру', en: 'Retake' },
  deletePhoto: { ru: 'Удалить', kk: 'Жою', en: 'Delete' },
  photoDiagnosticTitle: { ru: 'Сделай фото автомобиля\nИИ распознает повреждения\nи предложит решение', kk: 'Автомобильдің фотосын түсіріңіз\nЖасанды интеллект зақымдануларды танып\nшешім ұсынады', en: 'Take a photo of your car\nAI will detect damage\nand suggest solutions' },
  analyzing: { ru: 'Анализ...', kk: 'Талдау...', en: 'Analyzing...' },
  analyze: { ru: 'Проанализировать', kk: 'Талдау', en: 'Analyze' },
  analysisComplete: { ru: 'Анализ завершен', kk: 'Талдау аяқталды', en: 'Analysis Complete' },
  analysisError: { ru: 'Ошибка анализа изображения', kk: 'Суретті талдау қатесі', en: 'Image analysis error' },
  fileSizeError: { ru: 'Размер файла не должен превышать 5MB', kk: 'Файл өлшемі 5МБ-тан аспауы керек', en: 'File size must not exceed 5MB' },
  carDiagnosticAlt: { ru: 'Автомобиль для диагностики', kk: 'Диагностика үшін автомобиль', en: 'Car for diagnostic' },
  
  // Common messages
  error: { ru: 'Ошибка', kk: 'Қате', en: 'Error' },
  success: { ru: 'Успешно', kk: 'Сәтті', en: 'Success' },
  loading: { ru: 'Загрузка...', kk: 'Жүктелуде...', en: 'Loading...' },
  saved: { ru: 'Сохранено', kk: 'Сақталды', en: 'Saved' },
  deleted: { ru: 'Удалено', kk: 'Жойылды', en: 'Deleted' },
  registrationComplete: { ru: 'Регистрация завершена', kk: 'Тіркелу аяқталды', en: 'Registration complete' },
  loginComplete: { ru: 'Вход выполнен', kk: 'Кіру орындалды', en: 'Signed in' },
  invalidPhone: { ru: 'Введите корректный номер телефона в формате +7 XXX XXX XXXX', kk: 'Телефон нөмірін +7 XXX XXX XXXX форматында енгізіңіз', en: 'Enter a valid phone number in format +7 XXX XXX XXXX' },
  roleAdded: { ru: 'Роль добавлена', kk: 'Рөл қосылды', en: 'Role added' },
  roleAddedToAccount: { ru: 'Роль {role} успешно добавлена к вашему аккаунту', kk: '{role} рөлі сіздің аккаунтыңызға сәтті қосылды', en: 'Role {role} added to your account' },
  userAgreementRequired: { ru: 'Необходимо согласие с пользовательским соглашением', kk: 'Пайдаланушы келісіміне келісу қажет', en: 'User agreement required' },
  fillAllFields: { ru: 'Заполните все обязательные поля', kk: 'Барлық міндетті өрістерді толтырыңыз', en: 'Fill in all required fields' },
  orderSuccess: { ru: 'Заказ успешно оформлен!', kk: 'Тапсырыс сәтті ресімделді!', en: 'Order placed successfully!' },
  orderError: { ru: 'Ошибка оформления заказа', kk: 'Тапсырысты ресімдеу қатесі', en: 'Order error' },
  requestError: { ru: 'Ошибка отправки запроса', kk: 'Сұрауды жіберу қатесі', en: 'Request error' },
  requestSuccess: { ru: 'Заявка успешно создана!', kk: 'Өтінім сәтті жасалды!', en: 'Request created successfully!' },
  requestCreateError: { ru: 'Ошибка при создании заявки', kk: 'Өтінімді жасау кезінде қате', en: 'Error creating request' },
  helpRequestSent: { ru: 'Запрос на помощь отправлен!', kk: 'Көмек сұрауы жіберілді!', en: 'Help request sent!' },
  continue: { ru: 'Продолжить', kk: 'Жалғастыру', en: 'Continue' },
  accountAlreadyHasRole: { ru: 'У этого номера уже есть аккаунт {role}. Используйте другой номер или войдите.', kk: 'Бұл нөмірде {role} аккаунты бар. Басқа нөмір пайдаланыңыз немесе кіріңіз.', en: 'This number already has a {role} account. Use another number or sign in.' },
  roleAddedSuccess: { ru: 'Роль {role} успешно добавлена к вашему аккаунту', kk: '{role} рөлі сіздің аккаунтыңызға сәтті қосылды', en: 'Role {role} added to your account' },
  
  // Partner Analytics
  masterWorkload: { ru: 'Загрузка мастеров', kk: 'Шеберлердің жүктемесі', en: 'Master Workload' },
  
  // About App
  aboutWelcomeTitle: { ru: 'Добро пожаловать в myAuto!', kk: 'myAuto-ға қош келдіңіз!', en: 'Welcome to myAuto!' },
  aboutWelcomeText: { ru: 'Ваш умный помощник по уходу за автомобилем.', kk: 'Сіздің ақылды көлік күтімі көмекшісі.', en: 'Your smart car care assistant.' },
  aboutFeaturesTitle: { ru: 'Основные возможности', kk: 'Негізгі мүмкіндіктер', en: 'Key Features' },
  aboutFeature1Title: { ru: 'Мониторинг автомобиля', kk: 'Көлікті бақылау', en: 'Car Monitoring' },
  aboutFeature1Desc: { ru: 'Отслеживайте пробег, техническое состояние и важные даты обслуживания', kk: 'Жүгіріс, техникалық жағдай және қызмет көрсетудің маңызды күндерін қадағалаңыз', en: 'Track mileage, condition and service dates' },
  aboutFeature2Title: { ru: 'AI-Консультант', kk: 'AI-Консультант', en: 'AI Consultant' },
  aboutFeature2Desc: { ru: 'Получайте мгновенные ответы на вопросы об обслуживании', kk: 'Қызмет көрсету туралы сұрақтарға жылдам жауаптар алыңыз', en: 'Get instant answers about maintenance' },
  aboutFeature3Title: { ru: 'Фото-диагностика', kk: 'Фото-диагностика', en: 'Photo Diagnostics' },
  aboutFeature3Desc: { ru: 'Сфотографируйте повреждение и получите оценку ремонта', kk: 'Зақымдауды суретке түсіріп, жөндеу бағасын алыңыз', en: 'Photo damage and get repair estimate' },
  aboutFeature4Title: { ru: 'Сервисы', kk: 'Қызметтер', en: 'Services' },
  aboutFeature4Desc: { ru: 'Быстрый доступ к проверенным автосервисам', kk: 'Тексерілген автосервистерге жылдам қолжетімділік', en: 'Quick access to verified services' },
  aboutBenefitsTitle: { ru: 'Преимущества', kk: 'Артықшылықтар', en: 'Benefits' },
  aboutBenefit1: { ru: 'Экономьте время на поиске информации', kk: 'Ақпарат іздеуге уақыт үнемдеңіз', en: 'Save time searching for info' },
  aboutBenefit2: { ru: 'Никогда не пропускайте важные сроки ТО', kk: 'ТҚ маңызды мерзімдерін ешқашан өткізіп алмаңыз', en: 'Never miss service dates' },
  aboutBenefit3: { ru: 'Контролируйте расходы на обслуживание', kk: 'Қызмет көрсету шығындарын бақылаңыз', en: 'Control maintenance costs' },
  aboutBenefit4: { ru: 'Быстрая диагностика проблем', kk: 'Мәселелерді жылдам диагностикалау', en: 'Quick problem diagnosis' },
  aboutBenefit5: { ru: 'Сообщество автолюбителей', kk: 'Автомобиль әуесқойларының қауымдастығы', en: 'Car enthusiast community' },
  aboutGuideTitle: { ru: 'Как пользоваться', kk: 'Қалай пайдалану', en: 'How to Use' },
  aboutStep1Title: { ru: 'Добавьте свой автомобиль', kk: 'Көлігіңізді қосыңыз', en: 'Add your car' },
  aboutStep1Desc: { ru: 'Внесите данные о марке, модели и пробеге', kk: 'Марка, модель және жүгіріс туралы деректерді енгізіңіз', en: 'Enter make, model and mileage' },
  aboutStep2Title: { ru: 'Настройте напоминания', kk: 'Еске салғыштарды орнатыңыз', en: 'Set reminders' },
  aboutStep2Desc: { ru: 'Установите даты замены масла, страховки', kk: 'Май ауыстыру, сақтандыру күндерін белгілеңіз', en: 'Set oil change and insurance dates' },
  aboutStep3Title: { ru: 'Задавайте вопросы AI', kk: 'AI-ға сұрақтар қойыңыз', en: 'Ask AI questions' },
  aboutStep3Desc: { ru: 'Получайте консультации по обслуживанию', kk: 'Қызмет көрсету бойынша кеңес алыңыз', en: 'Get maintenance advice' },
  aboutStep4Title: { ru: 'Используйте фото-диагностику', kk: 'Фото-диагностиканы пайдаланыңыз', en: 'Use photo diagnostics' },
  aboutStep4Desc: { ru: 'Сфотографируйте проблему и получите рекомендации', kk: 'Мәселені суретке түсіріп, ұсыныстар алыңыз', en: 'Photo issues and get recommendations' },
  aboutRights: { ru: 'Все права защищены', kk: 'Барлық құқықтар қорғалған', en: 'All rights reserved' },
  
  // Privacy & Account
  privacyPolicy: { ru: 'Политика конфиденциальности', kk: 'Құпиялылық саясаты', en: 'Privacy Policy' },
  dangerZone: { ru: 'Опасная зона', kk: 'Қауіпті аймақ', en: 'Danger Zone' },
  deleteAccount: { ru: 'Удалить аккаунт', kk: 'Аккаунтты жою', en: 'Delete Account' },
  deleteAccountWarning: { ru: 'Удаление аккаунта приведет к потере всех данных.', kk: 'Аккаунтты жою барлық деректердің жоғалуына әкеледі.', en: 'Deleting account will permanently remove all data.' },
  deleteAccountConfirmTitle: { ru: 'Удалить аккаунт навсегда?', kk: 'Аккаунтты мәңгілікке жою керек пе?', en: 'Delete account forever?' },
  deleteAccountConfirmDescription: { ru: 'Это действие необратимо.', kk: 'Бұл әрекет қайтарылмайды.', en: 'This action cannot be undone.' },
  deleteForever: { ru: 'Удалить навсегда', kk: 'Мәңгілікке жою', en: 'Delete Forever' },
  deleting: { ru: 'Удаление...', kk: 'Жойылуда...', en: 'Deleting...' },
  
  // Services
  servicesTitle: { ru: 'Автосервисы', kk: 'Автосервистер', en: 'Auto Services' },
  bookService: { ru: 'Запись на СТО', kk: 'СТО-ға жазылу', en: 'Book Service' },
  roadHelp: { ru: 'Помощь на дороге', kk: 'Жолда көмек', en: 'Roadside Help' },
  autoForum: { ru: 'Авто Форум', kk: 'Авто Форум', en: 'Auto Forum' },
  autoShops: { ru: 'Автомагазины', kk: 'Автодүкендер', en: 'Auto Shops' },
  detailing: { ru: 'Детейлинг', kk: 'Детейлинг', en: 'Detailing' },
  paintShop: { ru: 'Автомаляры', kk: 'Авто бояушылар', en: 'Paint Shop' },
  partsDismantling: { ru: 'Авторазборы', kk: 'Авто бөлшектері', en: 'Parts Dismantling' },
  carWash: { ru: 'Автомойки', kk: 'Автожуғыш', en: 'Car Wash' },
  
  // Service blocks
  catalog: { ru: 'Каталог', kk: 'Каталог', en: 'Catalog' },
  catalogSubtitle: { ru: 'Новые и б/у запчасти', kk: 'Жаңа және б/ү бөлшектер', en: 'New & used parts' },
  news: { ru: 'Новости', kk: 'Жаңалықтар', en: 'News' },
  newsSubtitle: { ru: 'Последние обновления', kk: 'Соңғы жаңартулар', en: 'Latest updates' },
  showroom3D: { ru: '3D-Шоурум', kk: '3D-Шоурум', en: '3D Showroom' },
  showroomSubtitle: { ru: 'Виртуальный просмотр авто', kk: 'Авто виртуалды қарау', en: 'Virtual car viewing' },
  
  // Stories
  storiesNews: { ru: 'Новости', kk: 'Жаңалықтар', en: 'News' },
  storiesPromo: { ru: 'Акции', kk: 'Акциялар', en: 'Promos' },
  storiesTips: { ru: 'Советы', kk: 'Кеңестер', en: 'Tips' },
  storiesReviews: { ru: 'Обзоры', kk: 'Шолулар', en: 'Reviews' },
  
  // Cart and Notifications
  cart: { ru: 'Корзина', kk: 'Себет', en: 'Cart' },
  emptyCart: { ru: 'Корзина пуста', kk: 'Себет бос', en: 'Cart is empty' },
  addToCart: { ru: 'Добавить в корзину', kk: 'Себетке қосу', en: 'Add to Cart' },
  notifications: { ru: 'Уведомления', kk: 'Хабарландырулар', en: 'Notifications' },
  noNotifications: { ru: 'Нет уведомлений', kk: 'Хабарландырулар жоқ', en: 'No notifications' },
  
  // Roadside Help
  shareLocation: { ru: 'Поделиться геолокацией', kk: 'Геолокацияны бөлісу', en: 'Share Location' },
  locationShared: { ru: 'Локация отправлена', kk: 'Локация жіберілді', en: 'Location shared' },
  requestHelp: { ru: 'Запросить помощь', kk: 'Көмек сұрау', en: 'Request Help' },
  describeProblem: { ru: 'Опишите вашу проблему...', kk: 'Мәселеңізді сипаттаңыз...', en: 'Describe your problem...' },
  sendHelpRequest: { ru: 'Отправить запрос', kk: 'Сұрауды жіберу', en: 'Send Request' },
  activeHelpersNearby: { ru: 'Активные помощники рядом', kk: 'Жақын жердегі белсенді көмекшілер', en: 'Active helpers nearby' },
  driversOnline: { ru: 'водителей онлайн в вашем районе', kk: 'жүргізушілер сіздің аймағыңызда онлайн', en: 'drivers online in your area' },
  yourLocation: { ru: 'Ваша локация', kk: 'Сіздің орныңыз', en: 'Your Location' },
  shareMyLocation: { ru: 'Поделиться моей локацией', kk: 'Менің орнымды бөлісу', en: 'Share My Location' },
  
  // Auto Forum
  trendingTopics: { ru: 'Популярные темы', kk: 'Танымал тақырыптар', en: 'Trending Topics' },
  joinConversation: { ru: 'Присоединяйтесь к обсуждению', kk: 'Талқылауға қосылыңыз', en: 'Join the conversation' },
  createNewPost: { ru: 'Создать пост', kk: 'Пост жасау', en: 'Create Post' },
  by: { ru: 'от', kk: 'арқылы', en: 'by' },
  replies: { ru: 'Ответы', kk: 'Жауаптар', en: 'Replies' },
  likes: { ru: 'Нравится', kk: 'Ұнайды', en: 'Likes' },
  
  // Auto Shops
  open: { ru: 'Открыто', kk: 'Ашық', en: 'Open' },
  closed: { ru: 'Закрыто', kk: 'Жабық', en: 'Closed' },
  partsAccessories: { ru: 'Запчасти и аксессуары', kk: 'Бөлшектер мен аксессуарлар', en: 'Parts & Accessories' },
  tires: { ru: 'Шины', kk: 'Шиналар', en: 'Tires' },
  maintenance: { ru: 'Обслуживание', kk: 'Қызмет көрсету', en: 'Maintenance' },
  
  // Detailing
  exteriorDetailing: { ru: 'Наружная детейлинг', kk: 'Сыртқы детейлинг', en: 'Exterior Detailing' },
  interiorDetailing: { ru: 'Внутренняя детейлинг', kk: 'Ішкі детейлинг', en: 'Interior Detailing' },
  fullDetailingPackage: { ru: 'Полный детейлинг', kk: 'Толық детейлинг', en: 'Full Detailing' },
  ceramicCoating: { ru: 'Керамическое покрытие', kk: 'Керамикалық жабын', en: 'Ceramic Coating' },
  fullExteriorClean: { ru: 'Полная наружная очистка', kk: 'Толық сыртқы тазалау', en: 'Full exterior cleaning' },
  deepInteriorClean: { ru: 'Глубокая внутренняя очистка', kk: 'Терең ішкі тазалау', en: 'Deep interior cleaning' },
  completeDetailing: { ru: 'Полная детейлинг', kk: 'Толық детейлинг', en: 'Complete detailing' },
  professionalCeramic: { ru: 'Профессиональное керамическое покрытие', kk: 'Кәсіби керамикалық жабын', en: 'Professional ceramic coating' },
  book: { ru: 'Записаться', kk: 'Жазылу', en: 'Book' },
  
  // Paint Shop
  scratchRemoval: { ru: 'Удаление царапин', kk: 'Сызаттарды жою', en: 'Scratch Removal' },
  panelPainting: { ru: 'Покраска панели', kk: 'Панельді бояу', en: 'Panel Painting' },
  bumperRepairPaint: { ru: 'Ремонт и покраска бампера', kk: 'Бамперді жөндеу және бояу', en: 'Bumper Repair & Paint' },
  fullCarRepaint: { ru: 'Полная покраска авто', kk: 'Автокөлікті толық бояу', en: 'Full Car Repaint' },
  minorScratch: { ru: 'Удаление мелких царапин', kk: 'Шағын сызаттарды жою', en: 'Minor scratch removal' },
  singlePanel: { ru: 'Покраска одной панели', kk: 'Бір панельді бояу', en: 'Single panel painting' },
  completeBumper: { ru: 'Полная реставрация бампера', kk: 'Бамперді толық қалпына келтіру', en: 'Complete bumper restoration' },
  professionalRepaint: { ru: 'Профессиональная покраска', kk: 'Кәсіби бояу', en: 'Professional repaint' },
  
  // Parts Dismantling
  searchParts: { ru: 'Поиск запчастей...', kk: 'Бөлшектерді іздеу...', en: 'Search parts...' },
  condition: { ru: 'Состояние', kk: 'Жағдайы', en: 'Condition' },
  good: { ru: 'Хорошее', kk: 'Жақсы', en: 'Good' },
  excellent: { ru: 'Отличное', kk: 'Тамаша', en: 'Excellent' },
  fair: { ru: 'Удовлетворительное', kk: 'Қанағаттанарлық', en: 'Fair' },
  
  // Car Wash
  servicesLabel: { ru: 'Услуги', kk: 'Қызметтер', en: 'Services' },
  nearbyLocations: { ru: 'Ближайшие локации', kk: 'Жақын орындар', en: 'Nearby Locations' },
  expressWash: { ru: 'Экспресс мойка', kk: 'Экспресс жуу', en: 'Express Wash' },
  standardWash: { ru: 'Стандартная мойка', kk: 'Стандартты жуу', en: 'Standard Wash' },
  premiumWash: { ru: 'Премиум мойка', kk: 'Премиум жуу', en: 'Premium Wash' },
  deluxePackage: { ru: 'Делюкс пакет', kk: 'Делюкс пакет', en: 'Deluxe Package' },
  quickExterior: { ru: 'Быстрая наружная мойка', kk: 'Жылдам сыртқы жуу', en: 'Quick exterior wash' },
  exteriorVacuum: { ru: 'Мойка + уборка салона', kk: 'Жуу + салон тазалау', en: 'Wash + interior vacuum' },
  fullServiceWax: { ru: 'Полная мойка с воском', kk: 'Балаумен толық жуу', en: 'Full wash with wax' },
  completeCleanInOut: { ru: 'Полная очистка', kk: 'Толық тазалау', en: 'Complete cleaning' },
  
  // Role Selection
  roleSelectionTitle: { ru: 'Как вы хотите использовать myAuto?', kk: 'myAuto-ны қалай пайдаланғыңыз келеді?', en: 'How do you want to use myAuto?' },
  roleSelectionSubtitle: { ru: 'Выберите роль для продолжения', kk: 'Жалғастыру үшін рөлді таңдаңыз', en: 'Choose a role to continue' },
  carOwner: { ru: 'Автовладелец', kk: 'Автокөлік иесі', en: 'Car Owner' },
  carOwnerDesc: { ru: 'Следите за своим\nавтомобилем', kk: 'Көлігіңізді\nбақылаңыз', en: 'Monitor your\ncar' },
  partner: { ru: 'Партнер', kk: 'Серіктес', en: 'Partner' },
  partnerDesc: { ru: 'Управляйте заказами\nвашего сервиса', kk: 'Сервисіңіздің\nтапсырыстарын басқарыңыз', en: 'Manage your\nservice orders' },
  continueAsUser: { ru: 'Продолжить как автовладелец', kk: 'Автокөлік иесі ретінде жалғастыру', en: 'Continue as car owner' },
  continueAsPartner: { ru: 'Продолжить как партнер', kk: 'Серіктес ретінде жалғастыру', en: 'Continue as partner' },
  
  // Bottom Navigation
  home: { ru: 'Главная', kk: 'Басты', en: 'Home' },
  services: { ru: 'Сервисы', kk: 'Қызметтер', en: 'Services' },
  photoDiagnostics: { ru: 'Фото диагностика', kk: 'Фото диагностика', en: 'Photo Diagnostics' },
  superChat: { ru: 'Супер Чат', kk: 'Супер Чат', en: 'Super Chat' },
  
  // Photo Diagnostics
  comingSoon: { ru: 'Скоро!', kk: 'Жақында!', en: 'Coming Soon!' },
  workingOn: { ru: 'Мы работаем над созданием:', kk: 'Біз жасап жатырмыз:', en: 'We are working on:' },
  aiDamageRecognition: { ru: 'AI распознавание повреждений', kk: 'AI зақым тану', en: 'AI damage recognition' },
  instantPhotoAnalysis: { ru: 'Мгновенный анализ фото', kk: 'Лезде фото талдау', en: 'Instant photo analysis' },
  smartRepairRecommendations: { ru: 'Умные рекомендации по ремонту', kk: 'Ақылды жөндеу ұсыныстары', en: 'Smart repair recommendations' },
  costEstimation: { ru: 'Оценка стоимости', kk: 'Құн бағалау', en: 'Cost estimation' },
  stayTuned: { ru: 'Следите за обновлениями!', kk: 'Жаңартуларды қадағалаңыз!', en: 'Stay tuned!' },
  
  // Super Chat
  chatAiHelper: { ru: 'Привет! Я твой AI помощник по авто. 🚗', kk: 'Сәлем! Мен сіздің AI автомобиль көмекшісімін! 🚗', en: 'Hi! I\'m your AI car assistant. 🚗' },
  thinking: { ru: 'Думаю...', kk: 'Ойланып жатырмын...', en: 'Thinking...' },
  you: { ru: 'Вы', kk: 'Сіз', en: 'You' },
  now: { ru: 'сейчас', kk: 'қазір', en: 'now' },
  message: { ru: 'Сообщение', kk: 'Хабарлама', en: 'Message' },
  community: { ru: 'Сообщество', kk: 'Қоғамдастық', en: 'Community' },
  communitySoon: { ru: 'Сообщество скоро!', kk: 'Қоғамдастық жақында!', en: 'Community coming soon!' },
  workingOnCommunity: { ru: 'Мы работаем над созданием сообщества:', kk: 'Біз қоғамдастық құрумен айналысамыз:', en: 'We are building a community:' },
  groupChats: { ru: 'Групповые чаты', kk: 'Топтық чаттар', en: 'Group Chats' },
  chatWithOthers: { ru: 'Общайтесь с другими автовладельцами', kk: 'Басқа автоиелерімен сөйлесіңіз', en: 'Chat with other car owners' },
  thematicGroups: { ru: 'Тематические группы', kk: 'Тақырыптық топтар', en: 'Themed Groups' },
  joinGroups: { ru: 'Присоединяйтесь к группам по интересам', kk: 'Қызығушылық топтарына қосылыңыз', en: 'Join interest groups' },
  shareExperience: { ru: 'Обмен опытом', kk: 'Тәжірибе алмасу', en: 'Share Experience' },
  shareTips: { ru: 'Делитесь советами и получайте помощь', kk: 'Кеңестермен бөлісіңіз және көмек алыңыз', en: 'Share tips and get help' },
  tooManyRequests: { ru: 'Слишком много запросов', kk: 'Тым көп сұрау', en: 'Too many requests' },
  waitBefore: { ru: 'Пожалуйста, подождите немного', kk: 'Біраз күтіңіз', en: 'Please wait a moment' },
  paymentRequired: { ru: 'Требуется оплата', kk: 'Төлем қажет', en: 'Payment required' },
  needTopUp: { ru: 'Необходимо пополнить баланс', kk: 'Балансты толтыру қажет', en: 'Balance top-up required' },
  couldNotGetResponse: { ru: 'Не удалось получить ответ', kk: 'Жауап алу мүмкін болмады', en: 'Could not get response' },
  voiceChatSoon: { ru: 'Голосовое общение скоро будет доступно', kk: 'Дауыстық қарым-қатынас жақында қолжетімді болады', en: 'Voice chat coming soon' },
  workingOnFeature: { ru: 'Мы работаем над этой функцией', kk: 'Біз бұл функция үстінде жұмыс істеп жатырмыз', en: 'We are working on this feature' },
  
  // Profile Management
  profileTitle: { ru: 'Профиль', kk: 'Профиль', en: 'Profile' },
  myVehicles: { ru: 'Мои автомобили', kk: 'Менің көліктерім', en: 'My Vehicles' },
  serviceHistoryTitle: { ru: 'История сервиса', kk: 'Қызмет тарихы', en: 'Service History' },
  profileSettingsTitle: { ru: 'Настройки профиля', kk: 'Профиль параметрлері', en: 'Profile Settings' },
  logoutTitle: { ru: 'Выйти', kk: 'Шығу', en: 'Log Out' },
  logoutConfirm: { ru: 'Вы уверены, что хотите выйти?', kk: 'Шығуға сенімдісіз бе?', en: 'Are you sure you want to log out?' },
  confirmLogout: { ru: 'Выйти', kk: 'Шығу', en: 'Log Out' },
  addVehicle: { ru: 'Добавить автомобиль', kk: 'Көлік қосу', en: 'Add Vehicle' },
  noVehicles: { ru: 'У вас пока нет автомобилей', kk: 'Сізде әлі көлік жоқ', en: 'You have no vehicles yet' },
  addYourCar: { ru: 'Добавить свое авто', kk: 'Көлігіңізді қосыңыз', en: 'Add your car' },
  addFirstVehicle: { ru: 'Добавьте свой первый автомобиль', kk: 'Бірінші көлігіңізді қосыңыз', en: 'Add your first vehicle' },
  brand: { ru: 'Марка', kk: 'Маркасы', en: 'Brand' },
  selectBrand: { ru: 'Выберите марку', kk: 'Маркасын таңдаңыз', en: 'Select brand' },
  model: { ru: 'Модель', kk: 'Үлгісі', en: 'Model' },
  enterModel: { ru: 'Введите модель', kk: 'Үлгісін енгізіңіз', en: 'Enter model' },
  year: { ru: 'Год', kk: 'Жылы', en: 'Year' },
  vin: { ru: 'VIN', kk: 'VIN', en: 'VIN' },
  plate: { ru: 'Гос. номер', kk: 'Мемлекеттік нөмірі', en: 'License Plate' },
  vehicleMileage: { ru: 'Пробег', kk: 'Жүгірген жолы', en: 'Mileage' },
  isPrimary: { ru: 'Основной автомобиль', kk: 'Негізгі көлік', en: 'Primary Vehicle' },
  edit: { ru: 'Редактировать', kk: 'Өңдеу', en: 'Edit' },
  delete: { ru: 'Удалить', kk: 'Жою', en: 'Delete' },
  deleteConfirm: { ru: 'Удалить автомобиль?', kk: 'Көлікті жою керек пе?', en: 'Delete vehicle?' },
  vehicleAdded: { ru: 'Автомобиль добавлен', kk: 'Көлік қосылды', en: 'Vehicle added' },
  vehicleUpdated: { ru: 'Автомобиль обновлен', kk: 'Көлік жаңартылды', en: 'Vehicle updated' },
  vehicleDeleted: { ru: 'Автомобиль удален', kk: 'Көлік жойылды', en: 'Vehicle deleted' },
  noServiceHistory: { ru: 'История обслуживания пуста', kk: 'Қызмет тарихы бос', en: 'Service history is empty' },
  addFirstService: { ru: 'Добавьте первую запись', kk: 'Бірінші жазбаны қосыңыз', en: 'Add first record' },
  addService: { ru: 'Добавить запись', kk: 'Жазба қосу', en: 'Add Record' },
  serviceType: { ru: 'Тип обслуживания', kk: 'Қызмет түрі', en: 'Service Type' },
  serviceDate: { ru: 'Дата', kk: 'Күні', en: 'Date' },
  serviceProvider: { ru: 'СТО', kk: 'СТО', en: 'Service Center' },
  cost: { ru: 'Стоимость', kk: 'Құны', en: 'Cost' },
  description: { ru: 'Описание', kk: 'Сипаттама', en: 'Description' },
  notes: { ru: 'Примечания', kk: 'Ескертпелер', en: 'Notes' },
  nextServiceDate: { ru: 'Следующее обслуживание', kk: 'Келесі қызмет', en: 'Next Service' },
  mileageAtService: { ru: 'Пробег при обслуживании', kk: 'Қызмет кезіндегі жүгіріс', en: 'Mileage at service' },
  maintenanceType: { ru: 'ТО', kk: 'ТҚ', en: 'Maintenance' },
  repair: { ru: 'Ремонт', kk: 'Жөндеу', en: 'Repair' },
  diagnostics: { ru: 'Диагностика', kk: 'Диагностика', en: 'Diagnostics' },
  tireService: { ru: 'Шиномонтаж', kk: 'Шина монтажы', en: 'Tire Service' },
  oilChangeService: { ru: 'Замена масла', kk: 'Май ауыстыру', en: 'Oil Change' },
  other: { ru: 'Другое', kk: 'Басқа', en: 'Other' },
  serviceAdded: { ru: 'Запись добавлена', kk: 'Жазба қосылды', en: 'Record added' },
  serviceUpdated: { ru: 'Запись обновлена', kk: 'Жазба жаңартылды', en: 'Record updated' },
  serviceDeleted: { ru: 'Запись удалена', kk: 'Жазба жойылды', en: 'Record deleted' },
  selectVehicle: { ru: 'Выберите автомобиль', kk: 'Көлікті таңдаңыз', en: 'Select vehicle' },
  profileCity: { ru: 'Город', kk: 'Қала', en: 'City' },
  profileFirstName: { ru: 'Имя', kk: 'Аты', en: 'First Name' },
  profileLastName: { ru: 'Фамилия', kk: 'Тегі', en: 'Last Name' },
  profilePatronymic: { ru: 'Отчество', kk: 'Әкесінің аты', en: 'Patronymic' },
  profileUpdated: { ru: 'Профиль обновлен', kk: 'Профиль жаңартылды', en: 'Profile updated' },
  
  // Common
  back: { ru: 'Назад', kk: 'Артқа', en: 'Back' },
  cancel: { ru: 'Отмена', kk: 'Болдырмау', en: 'Cancel' },
  save: { ru: 'Сохранить', kk: 'Сақтау', en: 'Save' },
  confirm: { ru: 'Подтвердить', kk: 'Растау', en: 'Confirm' },
  main: { ru: 'Основное', kk: 'Негізгі', en: 'Main' },
  logoutConfirmation: { ru: 'Вы уверены, что хотите выйти из аккаунта?', kk: 'Аккаунттан шығуға сенімдісіз бе?', en: 'Are you sure you want to log out?' },
  
  // Additional
  errorUpdating: { ru: 'Ошибка при обновлении', kk: 'Жаңарту қатесі', en: 'Error updating' },
  successUpdated: { ru: 'Успешно обновлено', kk: 'Сәтті жаңартылды', en: 'Successfully updated' },
  inCart: { ru: 'В корзине', kk: 'Себетте', en: 'In cart' },
  hours: { ru: 'часов', kk: 'сағат', en: 'hours' },
  day: { ru: 'день', kk: 'күн', en: 'day' },
  days: { ru: 'дней', kk: 'күн', en: 'days' },
  week: { ru: 'неделя', kk: 'апта', en: 'week' },
  failedToLoadPartners: { ru: 'Ошибка загрузки партнеров', kk: 'Серіктестерді жүктеу қатесі', en: 'Failed to load partners' },
  failedToLoadVehicles: { ru: 'Ошибка загрузки автомобилей', kk: 'Көліктерді жүктеу қатесі', en: 'Failed to load vehicles' },
  failedToLoadMasters: { ru: 'Ошибка загрузки мастеров', kk: 'Шеберлерді жүктеу қатесі', en: 'Failed to load masters' },
  notAuthenticated: { ru: 'Не авторизован', kk: 'Авторизацияланбаған', en: 'Not authenticated' },
  
  // Under Development
  underDevelopmentTitle: { ru: 'Раздел в разработке', kk: 'Бөлім әзірленуде', en: 'Under Development' },
  underDevelopmentDesc: { ru: 'Мы усердно работаем над этим разделом, чтобы предоставить вам лучший сервис. Совсем скоро здесь появится что-то интересное!', kk: 'Біз сізге ең жақсы қызметті ұсыну үшін осы бөлімде жұмыс істеп жатырмыз. Жақында мұнда қызықты нәрсе пайда болады!', en: 'We are working hard on this section to provide you the best service. Something interesting will appear here soon!' },
  supportProject: { ru: 'Поддержать проект', kk: 'Жобаны қолдау', en: 'Support Project' },
  supportProjectDesc: { ru: 'Ваша поддержка поможет нам быстрее развивать приложение', kk: 'Сіздің қолдауыңыз қосымшаны тезірек дамытуға көмектеседі', en: 'Your support helps us develop the app faster' },
  
  // Service subtitles
  soonUsedParts: { ru: 'Скоро: б/у запчасти по выгодным ценам', kk: 'Жақында: тиімді бағамен б/ү бөлшектер', en: 'Coming soon: used parts at great prices' },
  soonCarWashes: { ru: 'Скоро: автомойки рядом с вами', kk: 'Жақында: сіздің жаныңыздағы автожуғыштар', en: 'Coming soon: car washes near you' },
  soonPaintShop: { ru: 'Скоро: покраска и кузовной ремонт', kk: 'Жақында: бояу және шанақ жөндеу', en: 'Coming soon: painting and body repair' },
  soonDetailing: { ru: 'Скоро: профессиональный детейлинг', kk: 'Жақында: кәсіби детейлинг', en: 'Coming soon: professional detailing' },
  soonAutoServices: { ru: 'Скоро: запись на СТО онлайн', kk: 'Жақында: СТО-ға онлайн жазылу', en: 'Coming soon: online service booking' },
  soonAutoForum: { ru: 'Скоро: обсуждения, советы и опыт автолюбителей', kk: 'Жақында: талқылаулар, кеңестер және автосүйгіштер тәжірибесі', en: 'Coming soon: discussions, tips and car enthusiasts experience' },
  soonCatalog: { ru: 'Скоро: каталог автозапчастей', kk: 'Жақында: автобөлшектер каталогы', en: 'Coming soon: auto parts catalog' },
  soonNews: { ru: 'Скоро: новости автомира и обновления приложения', kk: 'Жақында: автоәлем жаңалықтары мен қосымша жаңартулары', en: 'Coming soon: auto world news and app updates' },
  soonShowroom: { ru: 'Скоро: виртуальный осмотр автомобилей', kk: 'Жақында: автомобильдерді виртуалды қарау', en: 'Coming soon: virtual car viewing' },
  soonAutoShops: { ru: 'Скоро: автомагазины рядом с вами', kk: 'Жақында: сіздің жаныңыздағы автодүкендер', en: 'Coming soon: auto shops near you' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('kk');

  useEffect(() => {
    const saved = localStorage.getItem('app_language') as Language;
    if (saved && (saved === 'ru' || saved === 'kk' || saved === 'en')) {
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
