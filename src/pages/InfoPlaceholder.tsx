import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "about": { title: "О нас", subtitle: "Команда myAuto+ — цифровой автосервис нового поколения." },
  "features": { title: "Возможности", subtitle: "Карточка здоровья, ИИ-диагностика, AutoGPT, автосервисы и многое другое." },
  "security": { title: "Безопасность", subtitle: "Мы защищаем ваши данные на уровне банковских стандартов." },
  "help": { title: "Помощь", subtitle: "Свяжитесь с нами: info@myautoplus.kz" },
  "workspace": { title: "Рабочий раздел партнёров", subtitle: "Личный кабинет СТО, магазинов и сервисов." },
  "investors": { title: "Для Инвесторов", subtitle: "Презентация, метрики и контакты для инвестиций — скоро." },
  "sto": { title: "Для СТО", subtitle: "Подключите свою станцию техобслуживания к экосистеме myAuto+." },
  "shops": { title: "Для Магазинов", subtitle: "Продавайте запчасти и аксессуары через myAuto+." },
  "painters": { title: "Для Маляров", subtitle: "Получайте заказы на покраску и кузовной ремонт." },
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

      <main className="mx-auto max-w-[720px] px-5 py-16 text-center">
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {info.title}
        </h1>
        <p style={{ marginTop: 16, fontSize: 17, color: "#86868B", lineHeight: 1.5 }}>
          {info.subtitle}
        </p>
        <p style={{ marginTop: 40, fontSize: 15, color: "#86868B" }}>
          Раздел скоро будет доступен. Следите за обновлениями.
        </p>
      </main>
    </div>
  );
};

export default InfoPlaceholder;
