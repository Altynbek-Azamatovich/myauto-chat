import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

import mockupDashboard from "@/assets/landing/mockup-dashboard.png";
import mockupChat from "@/assets/landing/mockup-chat.png";
import mockupServices from "@/assets/landing/mockup-services.png";
import screenDashboard from "@/assets/landing/screen-dashboard.png";
import screenCrash from "@/assets/landing/screen-crash.png";
import screenRoadside from "@/assets/landing/screen-roadside.png";
import logoMyAuto from "@/assets/landing/logo-myauto.png";
import crown from "@/assets/landing/ornament-crown.png";

const font = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif',
};

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
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
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
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ---------- iPhone mockup (frameless white card with subtle shadow) ---------- */
const PhoneMock: React.FC<{ src: string; alt: string; className?: string }> = ({
  src,
  alt,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`relative mx-auto ${className}`}
    >
      <div
        className="relative mx-auto overflow-hidden bg-white"
        style={{
          width: "min(300px, 82vw)",
          aspectRatio: "9 / 19.5",
          borderRadius: 40,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
        }}
      >
        <img src={src} alt={alt} className="block h-full w-full object-cover" />
      </div>
    </motion.div>
  );
};

/* ---------- golden crown ornament ---------- */
const Crown: React.FC = () => (
  <div className="flex items-center justify-center" style={{ marginTop: 40, marginBottom: 40 }}>
    <img src={crown} alt="" aria-hidden className="h-8 w-8 object-contain" />
  </div>
);

/* ---------- store badges ---------- */
const StoreButtons: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-row items-center justify-center gap-3 ${className}`}>
    <a
      href="#"
      className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ width: 140, height: 45 }}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="text-[13px] font-medium leading-none">App Store</span>
    </a>
    <a
      href="#"
      className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ width: 140, height: 45 }}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.38l2.584 1.574c.488.296.488 1.003 0 1.299l-2.584 1.573-2.543-2.543 2.543-2.544v.641zm-3.906-1.378L5.157 1.314l10.937 6.333-2.302 2.302z" />
      </svg>
      <span className="text-[13px] font-medium leading-none">Google Play</span>
    </a>
  </div>
);

/* ---------- alternating section block (text + phone) ---------- */
const Section: React.FC<{
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  image?: string;
  alt?: string;
  reverse?: boolean;
  showCrown?: boolean;
  children?: React.ReactNode;
}> = ({ id, title, description, image, alt, reverse = false, showCrown = true, children }) => (
  <section id={id} className="px-5">
    {showCrown && <Crown />}
    <div
      className={`mx-auto flex max-w-[1200px] flex-col items-center gap-10 md:gap-16 ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      } md:justify-between`}
    >
      <div className="w-full text-center md:w-1/2 md:text-left">
        <FadeUp>
          <h2 className="text-[24px] font-bold leading-tight text-neutral-900 md:text-[32px]">
            {title}
          </h2>
          {description && (
            <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-[#86868B] md:mx-0">
              {description}
            </p>
          )}
          {children}
        </FadeUp>
      </div>
      {image && (
        <div className="w-full md:w-1/2">
          <ScaleIn delay={0.1}>
            <PhoneMock src={image} alt={alt || ""} />
          </ScaleIn>
        </div>
      )}
    </div>
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
      setAtBottom(scrolled >= full - 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "О нас" },
    { href: "#features", label: "Возможности" },
    { href: "#partners", label: "Партнёрам" },
    { href: "#contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900" style={font}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-neutral-100"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div className="relative mx-auto flex max-w-[1200px] items-center justify-center px-5" style={{ height: 64 }}>
          <img src={logoMyAuto} alt="myAuto" style={{ height: 40 }} className="md:!h-12" />
          <button
            onClick={() => setMenuOpen(true)}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-800 hover:bg-neutral-100"
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Fullscreen menu overlay */}
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
              <div className="flex items-center justify-between px-5" style={{ height: 64 }}>
                <img src={logoMyAuto} alt="myAuto" style={{ height: 40 }} />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-2 text-neutral-800 hover:bg-neutral-100"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" strokeWidth={2} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col items-center justify-center gap-8">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.4 }}
                    className="text-3xl font-semibold text-neutral-900 hover:text-blue-600"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="px-5 pt-10 pb-4 md:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[640px] text-center">
            <FadeUp>
              <h1
                className="font-bold text-neutral-900"
                style={{ fontSize: 32, lineHeight: 1.2 }}
              >
                AI — автосервис нового поколения
              </h1>
              <p className="mt-3 text-[18px]" style={{ color: "#86868B" }}>
                просто, умно, быстро
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-8 text-[22px] font-medium leading-snug text-neutral-900 md:text-[28px]">
                Здесь начинается
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  цифровая жизнь
                </span>
                <br />
                твоего авто
              </p>
            </FadeUp>
            <FadeUp delay={0.2} className="mt-8">
              <StoreButtons />
            </FadeUp>
          </div>
          <ScaleIn delay={0.25} className="mt-10">
            <PhoneMock src={mockupDashboard} alt="myAuto Dashboard" />
          </ScaleIn>
        </div>
      </section>

      {/* Экосистема — intro */}
      <section id="about" className="px-5">
        <Crown />
        <div className="mx-auto max-w-[640px] text-center">
          <FadeUp>
            <h2 className="text-[24px] font-bold text-neutral-900">
              Всё в одном <span className="text-blue-600">приложении</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed" style={{ color: "#86868B" }}>
              В myAuto+ есть всё. Быстрый доступ к качественным автоуслугам.
            </p>
          </FadeUp>
        </div>
      </section>

      <div id="features">
        <Section
          title="Карточка здоровья"
          description="История, обслуживание, страховка и напоминания — всё в одной умной карточке."
          image={mockupDashboard}
          alt="Карточка здоровья"
        />

        <Section
          title="Автосервисы"
          description="Нужный сервис — всегда под рукой."
          image={mockupServices}
          alt="Автосервисы"
          reverse
        />

        <Section
          title="Диагностика по фото"
          description="ИИ находит повреждения, оценивает ремонт, находит СТО. Точно и быстро."
          image={screenCrash}
          alt="Диагностика по фото"
        />

        <Section
          title={<>AutoGPT — <span className="text-blue-600">ИИ Чат</span></>}
          description="Подскажет, найдёт, посоветует. Подбор запчастей, рекомендации, советы по уходу — всегда на связи."
          image={mockupChat}
          alt="AutoGPT чат"
          reverse
        />
      </div>

      {/* Платформы и Тюнинг */}
      <section id="download" className="px-5">
        <Crown />
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[640px] text-center">
            <FadeUp>
              <h2 className="text-[24px] font-bold text-neutral-900 md:text-[32px]">
                Доступно на всех платформах
              </h2>
              <p className="mt-3 text-[16px]" style={{ color: "#86868B" }}>
                Скачайте myAuto+ и добавьте авто в свой гараж
              </p>
            </FadeUp>
            <FadeUp delay={0.1} className="mt-7">
              <StoreButtons />
            </FadeUp>
          </div>
          <ScaleIn delay={0.2} className="mt-10">
            <PhoneMock src={screenRoadside} alt="Тюнинг" />
          </ScaleIn>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 md:py-24">
        <FadeUp className="mx-auto max-w-[640px] text-center">
          <p className="text-[16px] leading-relaxed text-neutral-700 md:text-[18px]">
            Попробуйте наше приложение уже сегодня и убедитесь сами,
            как просто управлять обслуживанием вашего автомобиля
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href="#download"
              className="inline-flex w-full items-center justify-center gap-2 bg-neutral-900 text-[15px] font-medium text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ height: 56, borderRadius: 14 }}
            >
              Скачать приложение <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#partners"
              className="inline-flex w-full items-center justify-center border border-neutral-900/80 bg-transparent text-[15px] font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
              style={{ height: 56, borderRadius: 14 }}
            >
              Стать партнёром
            </a>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer id="contacts" className="bg-neutral-950 px-5 py-14 text-neutral-300">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-4">
            <img src={logoMyAuto} alt="myAuto" style={{ height: 64, filter: "invert(1)" }} className="self-start" />
            <p className="max-w-sm text-[14px] text-neutral-400">
              Цифровой помощник для автовладельцев. Управляйте историями вашего автомобиля легко и удобно.
            </p>
          </div>

          <div id="partners" className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h4 className="mb-3 text-[14px] font-semibold text-white">Приложение</h4>
              <ul className="space-y-2 text-[14px] text-neutral-400">
                <li><a href="#about" className="transition-colors hover:text-white">О нас</a></li>
                <li><a href="#features" className="transition-colors hover:text-white">Возможности</a></li>
                <li><a href="/privacy" className="transition-colors hover:text-white">Безопасность</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Помощь</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-[14px] font-semibold text-white">Партнёрам</h4>
              <ul className="space-y-2 text-[14px] text-neutral-400">
                <li><a href="#" className="transition-colors hover:text-white">Для Инвесторов</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Для СТО</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Для Магазинов</a></li>
                <li><a href="#" className="transition-colors hover:text-white">Для Маляров</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="mb-3 text-[14px] font-semibold text-white">Контакты</h4>
              <ul className="space-y-2 text-[14px] text-neutral-400">
                <li><a href="mailto:info@myautoplus.kz" className="transition-colors hover:text-white">info@myautoplus.kz</a></li>
                <li><a href="tel:+77772373000" className="transition-colors hover:text-white">+7 (777) 237 30 00</a></li>
                <li>Казахстан, Астана</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-[12px] text-neutral-500 md:flex-row md:items-center">
            <span>© myAuto+, 2025. Все права защищены.</span>
            <a href="/privacy" className="transition-colors hover:text-white">Политика конфиденциальности</a>
          </div>
        </div>
      </footer>

      {/* Floating store buttons — hide when at footer */}
      <AnimatePresence>
        {!atBottom && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-5"
          >
            <div
              className="rounded-2xl px-3 py-2"
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

export default Landing;
