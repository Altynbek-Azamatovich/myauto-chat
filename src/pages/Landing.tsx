import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
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
    <img src={crown} alt="" aria-hidden style={{ height: 32, width: "auto" }} />
  </div>
);

/* ---------- Official-style App Store + Google Play badges (44px) ---------- */
const AppStoreBadge: React.FC = () => (
  <a href="#" aria-label="Download on the App Store" className="inline-block transition-transform hover:-translate-y-0.5">
    <svg height="44" viewBox="0 0 135 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="135" height="44" rx="9" fill="#000" />
      <g fill="#fff">
        <path d="M32.6 22.8c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.8 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.6-3.7zm-2.4-6.9c.6-.8 1.1-1.9.9-3-1 0-2.2.6-2.8 1.5-.6.7-1.1 1.9-1 2.9 1.2.1 2.3-.6 2.9-1.4z" />
        <text x="44" y="18" fontFamily="-apple-system, SF Pro Text, Helvetica, Arial" fontSize="8" fill="#fff">Download on the</text>
        <text x="44" y="32" fontFamily="-apple-system, SF Pro Display, Helvetica, Arial" fontSize="16" fontWeight="600" fill="#fff">App Store</text>
      </g>
    </svg>
  </a>
);

const GooglePlayBadge: React.FC = () => (
  <a href="#" aria-label="Get it on Google Play" className="inline-block transition-transform hover:-translate-y-0.5">
    <svg height="44" viewBox="0 0 152 44" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="152" height="44" rx="6" fill="#000" />
      <g transform="translate(12,10)">
        <path d="M0 1.2v21.6c0 .5.2.9.5 1.2L12.7 12 .5 0C.2.3 0 .7 0 1.2z" fill="#5BC9F4"/>
        <path d="M16.7 16l-4 4L.7 24c.2.1.4.1.6.1.3 0 .6-.1.9-.2L17 16h-.3z" fill="#EA4335"/>
        <path d="M16.7 8L1.5 0C1.2-.1.9-.1.6-.1c-.2 0-.4 0-.6.1l12 12 4-4z" fill="#34A853"/>
        <path d="M21.2 10.4l-4.5-2.4L12.7 12l4 4 4.5-2.4c1.4-.8 1.4-2.4 0-3.2z" fill="#FBBC04"/>
      </g>
      <text x="40" y="18" fontFamily="-apple-system, SF Pro Text, Roboto, Arial" fontSize="8" fill="#fff">GET IT ON</text>
      <text x="40" y="32" fontFamily="-apple-system, SF Pro Display, Roboto, Arial" fontSize="16" fontWeight="600" fill="#fff">Google Play</text>
    </svg>
  </a>
);

const StoreButtons: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-row items-center justify-center gap-3 ${className}`}>
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
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const full = document.documentElement.scrollHeight;
      setAtBottom(scrolled >= full - 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              <h1
                className="mx-auto"
                style={{
                  color: TEXT_PRIMARY,
                  fontWeight: 700,
                  lineHeight: 1.1,
                  fontSize: "clamp(36px, 8vw, 40px)",
                  letterSpacing: "-0.02em",
                }}
              >
                AI — автосервис нового поколения
              </h1>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 22,
                  fontWeight: 500,
                  color: TEXT_SECONDARY,
                }}
              >
                просто, умно, быстро
              </p>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 17,
                  fontWeight: 400,
                  color: TEXT_TERTIARY,
                  lineHeight: 1.5,
                }}
              >
                Здесь начинается цифровая жизнь твоего авто
              </p>
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

          <div
            className="grid grid-cols-1 gap-10 md:grid-cols-3"
            style={{ marginTop: 40 }}
          >
            <FooterCol
              title="Приложение"
              items={[
                { label: "О нас", href: "#about" },
                { label: "Возможности", href: "#features" },
                { label: "Безопасность", href: "/privacy" },
                { label: "Помощь", href: "#" },
                { label: "Техподдержка", href: "mailto:info@myautoplus.kz" },
              ]}
            />
            <FooterCol
              title="Партнёрам"
              items={[
                { label: "Рабочий раздел", href: "/partner-application" },
                { label: "Для Инвесторов", href: "#" },
                { label: "Для СТО", href: "#" },
                { label: "Для Магазинов", href: "#" },
                { label: "Для Маляров", href: "#" },
              ]}
            />
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
            <span>© myAuto+, 2025. Все права защищены.</span>
            <a href="/privacy" style={{ color: TEXT_SECONDARY }} className="hover:underline">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </footer>

      {/* ===== Floating store badges (hide at bottom) ===== */}
      <AnimatePresence>
        {!atBottom && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-5 pointer-events-none"
          >
            <div
              className="pointer-events-auto rounded-2xl px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              <StoreButtons />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
