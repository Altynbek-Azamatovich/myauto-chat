import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

import mockupDashboard from "@/assets/landing/mockup-dashboard.png";
import mockupChat from "@/assets/landing/mockup-chat.png";
import mockupServices from "@/assets/landing/mockup-services.png";
import screenCrash from "@/assets/landing/screen-crash.png";
import screenRoadside from "@/assets/landing/screen-roadside.png";
import logoMyAuto from "@/assets/landing/logo-myauto.png";
import crown from "@/assets/landing/ornament-crown.png";

/* ---------- Apple system typography ---------- */
const font = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Helvetica Neue", sans-serif',
  WebkitFontSmoothing: "antialiased" as const,
  MozOsxFontSmoothing: "grayscale" as const,
};

const TEXT_PRIMARY = "#1D1D1F";
const TEXT_SECONDARY = "#86868B";
const TEXT_TERTIARY = "#515154";
const BORDER_LIGHT = "#D2D2D7";
const SURFACE_LIGHT = "#F5F5F7";

/* ---------- animation helpers ---------- */
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ScaleIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ---------- iPhone placeholder (320x680, radius 40) ---------- */
const PhoneMock: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <div
    className="relative mx-auto overflow-hidden bg-white"
    style={{
      width: "min(320px, 82vw)",
      aspectRatio: "320 / 680",
      borderRadius: 40,
      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    }}
  >
    <img src={src} alt={alt} className="block h-full w-full object-cover" />
  </div>
);

/* ---------- golden crown divider ---------- */
const Crown: React.FC = () => (
  <div className="flex items-center justify-center" style={{ marginTop: 64, marginBottom: 32 }}>
    <img src={crown} alt="" aria-hidden style={{ height: 48, width: "auto" }} />
  </div>
);

/* ---------- Store badges: transparent, only logo+wordmark ---------- */
const AppStoreBadge: React.FC = () => (
  <a
    href="#"
    aria-label="Download on the App Store"
    className="inline-flex items-center transition-transform hover:-translate-y-0.5"
    style={{ height: 44, background: "transparent", border: "none", padding: 0 }}
  >
    <svg height="44" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: "block" }}>
      <path fill="#1D1D1F" d="M24.77 20.3c-.02-2.4 1.96-3.56 2.05-3.62-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.9.87-3.65.87-.76 0-1.92-.85-3.16-.83-1.62.02-3.13.95-3.97 2.4-1.7 2.95-.43 7.3 1.21 9.69.81 1.17 1.77 2.48 3.02 2.43 1.22-.05 1.68-.78 3.15-.78 1.46 0 1.88.78 3.16.75 1.31-.02 2.13-1.18 2.93-2.36.92-1.35 1.3-2.66 1.32-2.73-.03-.01-2.54-.97-2.57-3.86zm-2.39-7.09c.67-.81 1.13-1.94.99-3.05-.96.04-2.12.64-2.81 1.44-.62.71-1.16 1.84-1.02 2.94 1.07.08 2.16-.55 2.84-1.33z"/>
      <text x="36" y="17" fontFamily="-apple-system, SF Pro Text, Helvetica, Arial" fontSize="7" fill="#1D1D1F">Download on the</text>
      <text x="36" y="31" fontFamily="-apple-system, SF Pro Display, Helvetica, Arial" fontSize="16" fontWeight="600" fill="#1D1D1F">App Store</text>
    </svg>
  </a>
);

const GooglePlayBadge: React.FC = () => (
  <a
    href="#"
    aria-label="Get it on Google Play"
    className="inline-flex items-center transition-transform hover:-translate-y-0.5"
    style={{ height: 44, background: "transparent", border: "none", padding: 0 }}
  >
    <svg height="44" viewBox="0 0 135 40" xmlns="http://www.w3.org/2000/svg" role="img" style={{ display: "block" }}>
      <g transform="translate(8,10)">
        <path d="M0 .8v20.4c0 .47.18.85.47 1.13L11.93 11 .47-.33C.18-.05 0 .33 0 .8z" fill="#5BC9F4"/>
        <path d="M15.74 15.1l-3.81 3.81L.69 22.5c.18.09.38.13.58.13.27 0 .55-.07.83-.21L16 15.1h-.26z" fill="#EA4335"/>
        <path d="M15.74 6.9L1.55-.4C1.27-.54.99-.6.72-.6c-.2 0-.4.05-.58.13l11.79 11.55 3.81-3.81-.26-.37z" fill="#34A853"/>
        <path d="M20 9.9L15.74 7.5l-3.81 3.81 3.81 3.81L20 12.73c1.33-.76 1.33-2.07 0-2.83z" fill="#FBBC04"/>
      </g>
      <text x="36" y="17" fontFamily="-apple-system, SF Pro Text, Roboto, Arial" fontSize="7" fill="#1D1D1F">GET IT ON</text>
      <text x="36" y="31" fontFamily="-apple-system, SF Pro Display, Roboto, Arial" fontSize="16" fontWeight="600" fill="#1D1D1F">Google Play</text>
    </svg>
  </a>
);

const StoreButtons: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-row items-center justify-center ${className}`} style={{ gap: 16 }}>
    <AppStoreBadge />
    <GooglePlayBadge />
  </div>
);


/* ---------- centered section block ---------- */
const FeatureSection: React.FC<{
  id?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  image: string;
  alt: string;
}> = ({ id, title, description, image, alt }) => (
  <section id={id} className="px-5">
    <Crown />
    <div className="mx-auto max-w-[640px] text-center">
      <FadeUp>
        <h2 style={{ color: TEXT_PRIMARY, fontSize: 28, fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </h2>
        <p
          className="mx-auto"
          style={{
            marginTop: 12,
            maxWidth: 320,
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.5,
            color: TEXT_SECONDARY,
          }}
        >
          {description}
        </p>
      </FadeUp>
    </div>
    <ScaleIn delay={0.1} className="mt-8">
      <PhoneMock src={image} alt={alt} />
    </ScaleIn>
  </section>
);

/* ============== LANDING ============== */
const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);


  const navLinks = [
    { href: "#about", label: "О нас" },
    { href: "#features", label: "Возможности" },
    { href: "#download", label: "Скачать" },
    { href: "#contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen w-full bg-white" style={{ ...font, color: TEXT_PRIMARY }}>
      {/* ===== Header ===== */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${BORDER_LIGHT}`,
        }}
      >
        <div
          className="relative mx-auto flex max-w-[1200px] items-center justify-center"
          style={{ padding: "16px 20px" }}
        >
          <img src={logoMyAuto} alt="myAuto" style={{ height: 44, width: "auto" }} />
          <button
            onClick={() => setMenuOpen(true)}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1"
            aria-label="Menu"
          >
            <Menu style={{ width: 24, height: 24, color: TEXT_PRIMARY }} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ===== Fullscreen menu ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)" }}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between" style={{ padding: "16px 20px" }}>
                <img src={logoMyAuto} alt="myAuto" style={{ height: 44 }} />
                <button onClick={() => setMenuOpen(false)} aria-label="Close" className="p-1">
                  <X style={{ width: 24, height: 24, color: TEXT_PRIMARY }} strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col items-center justify-center gap-8">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                    style={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Hero ===== */}
      <section className="px-5" style={{ paddingTop: 60 }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[640px] text-center">
            <FadeUp>
              <p
                style={{
                  fontSize: 19,
                  fontWeight: 500,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.35,
                  textAlign: "center",
                }}
              >
                AI — автосервис нового поколения
                <br />
                просто, умно, быстро
              </p>
              <h1
                className="mx-auto"
                style={{
                  marginTop: 20,
                  color: TEXT_PRIMARY,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  fontSize: "clamp(40px, 11vw, 48px)",
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                }}
              >
                Здесь
                <br />
                начинается
                <br />
                цифровая жизнь
                <br />
                твоего авто
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div style={{ marginTop: 32 }}>
                <StoreButtons />
              </div>
            </FadeUp>
          </div>
          <ScaleIn delay={0.2}>
            <div style={{ marginTop: 48 }}>
              <PhoneMock src={mockupDashboard} alt="myAuto Dashboard" />
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* ===== Экосистема — intro ===== */}
      <section id="about" className="px-5">
        <Crown />
        <div className="mx-auto max-w-[640px] text-center">
          <FadeUp>
            <h2 style={{ color: TEXT_PRIMARY, fontSize: 28, fontWeight: 600 }}>
              Всё в одном приложении
            </h2>
            <p
              className="mx-auto"
              style={{
                marginTop: 12,
                maxWidth: 300,
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.5,
                color: TEXT_SECONDARY,
              }}
            >
              В myAuto+ есть всё. Быстрый доступ к качественным автоуслугам.
            </p>
          </FadeUp>
        </div>
        <ScaleIn delay={0.1} className="mt-8">
          <PhoneMock src={mockupServices} alt="Экосистема myAuto" />
        </ScaleIn>
      </section>

      <div id="features">
        <FeatureSection
          title="Карточка здоровья"
          description="История, обслуживание, страховка и напоминания — всё в одной умной карточке."
          image={mockupDashboard}
          alt="Карточка здоровья"
        />

        <FeatureSection
          title="Автосервисы"
          description="Нужный сервис — всегда под рукой."
          image={mockupServices}
          alt="Автосервисы"
        />

        <FeatureSection
          title="Диагностика по фото"
          description="ИИ находит повреждения, оценивает ремонт, находит СТО. Точно и быстро."
          image={screenCrash}
          alt="Диагностика по фото"
        />

        <FeatureSection
          title="AutoGPT — ИИ Чат"
          description="Подскажет, найдёт, посоветует. Подбор запчастей, рекомендации, советы по уходу — всегда на связи."
          image={mockupChat}
          alt="AutoGPT чат"
        />
      </div>

      {/* ===== Final CTA ===== */}
      <section id="download" className="px-5">
        <Crown />
        <div className="mx-auto max-w-[640px] text-center">
          <FadeUp>
            <h2 style={{ color: TEXT_PRIMARY, fontSize: 28, fontWeight: 600 }}>
              Доступно на всех платформах
            </h2>
            <p
              className="mx-auto"
              style={{
                marginTop: 12,
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.5,
                color: TEXT_SECONDARY,
                maxWidth: 360,
              }}
            >
              Скачайте myAuto+ и добавьте авто в свой гараж.
            </p>
            <p
              className="mx-auto"
              style={{
                marginTop: 16,
                fontSize: 17,
                fontWeight: 400,
                lineHeight: 1.5,
                color: TEXT_TERTIARY,
                maxWidth: 460,
              }}
            >
              Попробуйте наше приложение уже сегодня и убедитесь сами, как просто управлять обслуживанием вашего автомобиля.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ marginTop: 32 }}>
              <StoreButtons />
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{
                  height: 56,
                  borderRadius: 16,
                  background: TEXT_PRIMARY,
                  color: "#FFFFFF",
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                Скачать приложение <ArrowRight style={{ width: 18, height: 18 }} strokeWidth={2.2} />
              </a>
              <a
                href="/partner-application"
                className="inline-flex items-center justify-center transition-colors hover:bg-neutral-50"
                style={{
                  height: 56,
                  borderRadius: 16,
                  background: "transparent",
                  border: `1px solid ${BORDER_LIGHT}`,
                  color: TEXT_PRIMARY,
                  fontSize: 17,
                  fontWeight: 600,
                }}
              >
                Стать партнёром
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer
        id="contacts"
        style={{ background: SURFACE_LIGHT, padding: "40px 20px", marginTop: 64 }}
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-start gap-4">
            <img src={logoMyAuto} alt="myAuto" style={{ height: 56, width: "auto" }} />
            <p
              style={{
                maxWidth: 360,
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.5,
                color: TEXT_SECONDARY,
                textAlign: "left",
              }}
            >
              Цифровой помощник для автовладельцев. Управляйте историей вашего автомобиля легко и удобно.
            </p>
          </div>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <FooterCol
              title="Приложение"
              items={[
                { label: "О нас", href: "/info/about" },
                { label: "Возможности", href: "/info/features" },
                { label: "Безопасность", href: "/info/security" },
                { label: "Помощь", href: "/info/help" },
                { label: "Техподдержка", href: "mailto:info@myautoplus.kz" },
              ]}
            />
            <FooterCol
              title="Партнёрам"
              items={[
                { label: "Рабочий раздел", href: "/info/workspace" },
                { label: "Для Инвесторов", href: "/info/investors" },
                { label: "Для СТО", href: "/info/sto" },
                { label: "Для Магазинов", href: "/info/shops" },
                { label: "Для Маляров", href: "/info/painters" },
              ]}
            />
          </div>

          <div style={{ marginTop: 32 }}>
            <FooterCol
              title="Контакты"
              items={[
                { label: "info@myautoplus.kz", href: "mailto:info@myautoplus.kz" },
                { label: "+7 (777) 237 30 00", href: "tel:+77772373000" },
                { label: "Казахстан, Астана", href: "#" },
              ]}
            />
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: `1px solid ${BORDER_LIGHT}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 12,
              color: TEXT_SECONDARY,
            }}
            className="md:flex-row md:items-center md:justify-between"
          >
            <span>myAuto, 2026 Все права защищены.</span>
            <a
              href="https://myautoplus.kz/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: TEXT_SECONDARY }}
              className="hover:underline"
            >
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

const FooterCol: React.FC<{ title: string; items: { label: string; href: string }[] }> = ({
  title,
  items,
}) => (
  <div>
    <h4 style={{ fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16 }}>
      {title}
    </h4>
    <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((it) => (
        <li key={it.label}>
          <a
            href={it.href}
            style={{ fontSize: 15, fontWeight: 400, color: TEXT_PRIMARY }}
            className="transition-opacity hover:opacity-70"
          >
            {it.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Landing;
