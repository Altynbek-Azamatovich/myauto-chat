import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Section = { heading: string; body: string };
type Info = {
  title: string;
  subtitle: string;
  sections?: Section[];
};

const TITLES: Record<string, Info> = {
  about: {
    title: "Цифровой помощник, который меняет правила",
    subtitle:
      "myAuto — это новая культура владения автомобилем. Просто, умно, быстро.",
    sections: [
      {
        heading: "Наша миссия",
        body:
          "Сделать обслуживание автомобиля таким же простым, как заказ такси. Один аккаунт, одна история, один помощник — на всю жизнь машины.",
      },
      {
        heading: "Почему myAuto",
        body:
          "Мы объединяем водителей, СТО, магазины и сервисы в единую экосистему. ИИ помогает с диагностикой, подбором запчастей и принятием решений — а вы экономите время и деньги.",
      },
    ],
  },
  features: {
    title: "Возможности myAuto",
    subtitle: "Всё, что нужно автовладельцу — в одном приложении.",
    sections: [
      { heading: "Карточка здоровья авто", body: "История, обслуживание, страховка и напоминания — в одной умной карточке." },
      { heading: "Диагностика по фото", body: "ИИ находит повреждения, оценивает ремонт и подбирает СТО рядом." },
      { heading: "СуперЧат", body: "Подбор запчастей, рекомендации и советы по уходу — всегда на связи." },
      { heading: "Помощь на дороге", body: "Статус «Нужна помощь» уведомляет ближайших участников сети." },
      { heading: "Автосервисы рядом", body: "Быстрый поиск проверенных СТО, моек, детейлинга и малярки." },
      { heading: "Удобный интерфейс", body: "Минималистичный дизайн, быстрая навигация, всё под рукой." },
    ],
  },
  investors: {
    title: "Для Инвесторов",
    subtitle:
      "myAuto — растущий технологичный стартап в авто-сегменте Центральной Азии.",
    sections: [
      { heading: "Рынок", body: "Более 5 млн автомобилей в Казахстане. Цифровизация автосервиса только начинается." },
      { heading: "Продукт", body: "SuperApp для водителей и B2B-платформа myAuto Pro для СТО, магазинов и сервисов." },
      { heading: "Модель", body: "Комиссия с заказов, подписки для бизнеса, реклама и доп. сервисы." },
      { heading: "Контакты для инвестиций", body: "info@myautoplus.kz — отправьте запрос, и мы вышлем презентацию." },
    ],
  },
  business: {
    title: "Для Бизнеса",
    subtitle:
      "Экосистема myAuto Pro: поток клиентов, автоматизация и удобный профиль для вашего бизнеса.",
    sections: [
      {
        heading: "Если вы СТО",
        body:
          "Получайте заявки на ремонт и ТО, ведите историю клиентов, управляйте сменами и записями в одном кабинете.",
      },
      {
        heading: "Если вы магазин",
        body:
          "Продавайте запчасти и аксессуары через каталог myAuto. Подключение к ИИ-подбору и тысячам автовладельцев.",
      },
      {
        heading: "Если вы детейлинг или малярка",
        body:
          "Принимайте заказы на полировку, химчистку, покраску и кузовной ремонт напрямую из приложения.",
      },
      {
        heading: "Как подключиться",
        body: "Напишите на info@myautoplus.kz — мы откроем доступ к myAuto Pro и поможем с настройкой.",
      },
    ],
  },
};

const InfoPlaceholder = () => {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const info = TITLES[slug] ?? { title: "Раздел", subtitle: "Раздел в разработке." };

  return (
    <div
      className="min-h-screen w-full bg-white"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Helvetica Neue", sans-serif',
        color: "#1D1D1F",
      }}
    >
      <header
        className="sticky top-0 z-40 flex items-center gap-3"
        style={{
          padding: "16px 20px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #D2D2D7",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: "#1D1D1F" }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} strokeWidth={1.8} />
          Назад на главную
        </button>
      </header>

      <main className="mx-auto max-w-[760px] px-5 py-16 md:py-24">
        <h1
          className="text-center"
          style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          {info.title}
        </h1>
        <p
          className="text-center"
          style={{ marginTop: 20, fontSize: 19, color: "#86868B", lineHeight: 1.5 }}
        >
          {info.subtitle}
        </p>

        {info.sections && (
          <div style={{ marginTop: 64, display: "grid", gap: 40 }}>
            {info.sections.map((s) => (
              <section key={s.heading}>
                <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>
                  {s.heading}
                </h2>
                <p style={{ marginTop: 10, fontSize: 17, color: "#424245", lineHeight: 1.6 }}>
                  {s.body}
                </p>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InfoPlaceholder;
