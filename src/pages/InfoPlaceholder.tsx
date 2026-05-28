import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Helvetica Neue", sans-serif';
const INK = "#1D1D1F";
const MUTED = "#86868B";
const BODY = "#424245";
const LINE = "#D2D2D7";

const Shell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-white" style={{ fontFamily: FONT, color: INK }}>
      <header
        className="sticky top-0 z-40 flex items-center gap-3"
        style={{
          padding: "16px 20px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: INK }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} strokeWidth={1.8} />
          Назад на главную
        </button>
      </header>
      {children}
    </div>
  );
};

const Hero = ({
  title,
  subtitle,
  weight = 700,
}: {
  title: string;
  subtitle: string;
  weight?: number;
}) => (
  <div className="mx-auto max-w-[820px] px-6 pt-20 md:pt-32 pb-12 md:pb-20 text-center">
    <h1
      style={{
        fontSize: "clamp(40px, 7vw, 72px)",
        fontWeight: weight,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
      }}
    >
      {title}
    </h1>
    <p
      className="mx-auto"
      style={{
        marginTop: 24,
        maxWidth: 640,
        fontSize: "clamp(17px, 2vw, 21px)",
        color: MUTED,
        lineHeight: 1.5,
      }}
    >
      {subtitle}
    </p>
  </div>
);

const Section = ({ children, border = false }: { children: React.ReactNode; border?: boolean }) => (
  <section
    className="mx-auto max-w-[1080px] px-6"
    style={{
      paddingTop: 72,
      paddingBottom: 72,
      borderTop: border ? `1px solid ${LINE}` : "none",
    }}
  >
    {children}
  </section>
);

/* --- About --- */
const About = () => (
  <>
    <Hero
      title="Технология, которая движет город"
      subtitle="Мы создаём цифровую экосистему myAuto, чтобы владение автомобилем стало предсказуемым, простым и прозрачным процессом."
    />
    <Section border>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 text-center">
        {[
          { n: "10к+", l: "пользователей в бета-доступе" },
          { n: "50+", l: "партнёров в экосистеме" },
          { n: "24/7", l: "доступность сервиса" },
        ].map((s) => (
          <div key={s.n}>
            <div style={{ fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              {s.n}
            </div>
            <div style={{ marginTop: 12, fontSize: 15, color: MUTED }}>{s.l}</div>
          </div>
        ))}
      </div>
    </Section>
  </>
);

/* --- Features --- */
const Features = () => {
  const cards = [
    { t: "Интеллектуальная диагностика", d: "Приложение знает о вашей машине больше, чем любой сервис: история, износ, рекомендации." },
    { t: "Маркетплейс услуг", d: "Запись на СТО и покупка запчастей в пару кликов — без звонков и торга." },
    { t: "Цифровая история", d: "Вся история обслуживания, ремонтов и страховок — всегда в кармане." },
    { t: "Поддержка на дороге", d: "Кнопка вызова помощи всегда на виду — ближайшие участники сети получают сигнал мгновенно." },
  ];
  return (
    <>
      <Hero title="Возможности" subtitle="Всё, что нужно автовладельцу — в одном приложении." />
      <Section border>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: LINE }}>
          {cards.map((c) => (
            <div key={c.t} style={{ background: "#fff", padding: "48px 36px" }}>
              <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>{c.t}</h3>
              <p style={{ marginTop: 12, fontSize: 17, color: BODY, lineHeight: 1.55 }}>{c.d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

/* --- Support --- */
const Support = () => (
  <>
    <Hero
      title="Мы на связи"
      subtitle="Наша команда отвечает в течение 15 минут. Напишите нам, если возникли вопросы по работе сервиса."
    />
    <Section>
      <div className="text-center">
        <a
          href="mailto:info@myautoplus.kz"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 600,
            color: "#2563eb",
            letterSpacing: "-0.02em",
            textDecoration: "none",
          }}
        >
          info@myautoplus.kz
        </a>
      </div>
    </Section>
  </>
);

/* --- Investors --- */
const Investors = () => {
  const blocks = [
    {
      h: "Проблема",
      b: "Рынок Казахстана фрагментирован: 5+ млн автомобилей, тысячи СТО и магазинов — но единого цифрового стандарта обслуживания нет.",
    },
    {
      h: "Решение",
      b: "myAuto — супер-апп для водителей и B2B-платформа для партнёров. Один аккаунт, одна история, единая экосистема услуг.",
    },
    {
      h: "Рост",
      b: "База пользователей растёт на 35% ежемесячно. Подключено 50+ партнёров в Алматы и Астане. Запуск на регионы — Q2 2026.",
    },
  ];
  return (
    <>
      <Hero title="Масштабируя будущее авторынка" subtitle="myAuto — растущий технологичный стартап в авто-сегменте Центральной Азии." />
      <Section border>
        <div className="mx-auto max-w-[720px] grid gap-16">
          {blocks.map((b, i) => (
            <div key={b.h} className="grid md:grid-cols-[120px_1fr] gap-6">
              <div style={{ fontSize: 14, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase", paddingTop: 6 }}>
                0{i + 1}
              </div>
              <div>
                <h3 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>{b.h}</h3>
                <p style={{ marginTop: 12, fontSize: 18, color: BODY, lineHeight: 1.6 }}>{b.b}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: 72 }}>
          <a
            href="mailto:info@myautoplus.kz?subject=Pitch%20Deck%20Request"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              border: `1px solid ${INK}`,
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 500,
              color: INK,
              textDecoration: "none",
            }}
          >
            Запросить Pitch Deck
          </a>
        </div>
      </Section>
    </>
  );
};

/* --- Business --- */
const Business = () => {
  const types = [
    { t: "СТО", d: "Полное управление записью, сменами и клиентской базой в одном кабинете." },
    { t: "Магазины запчастей", d: "Прямой доступ к целевой аудитории, которая уже ищет ваш товар." },
    { t: "Детейлинг и малярка", d: "Витрина ваших работ для тех, кто ценит качество исполнения." },
  ];
  return (
    <>
      <Hero
        title="Станьте частью myAuto Pro"
        subtitle="Платформа для тех, кто профессионально занимается обслуживанием автомобилей. Получайте поток клиентов и автоматизируйте учёт."
      />
      <Section border>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: LINE }}>
          {types.map((t) => (
            <div key={t.t} style={{ background: "#fff", padding: "48px 32px" }}>
              <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{t.t}</h3>
              <p style={{ marginTop: 12, fontSize: 16, color: BODY, lineHeight: 1.55 }}>{t.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center" style={{ marginTop: 72 }}>
          <p style={{ fontSize: 17, color: MUTED, marginBottom: 16 }}>Оставьте заявку на подключение</p>
          <a
            href="mailto:info@myautoplus.kz?subject=myAuto%20Pro"
            style={{ fontSize: 24, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}
          >
            info@myautoplus.kz
          </a>
        </div>
      </Section>
    </>
  );
};

const InfoPlaceholder = () => {
  const { slug = "" } = useParams();

  const render = () => {
    switch (slug) {
      case "about":
        return <About />;
      case "features":
        return <Features />;
      case "support":
        return <Support />;
      case "investors":
        return <Investors />;
      case "business":
        return <Business />;
      default:
        return <Hero title="Раздел" subtitle="Раздел в разработке." />;
    }
  };

  return <Shell>{render()}</Shell>;
};

export default InfoPlaceholder;
