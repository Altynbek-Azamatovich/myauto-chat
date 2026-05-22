import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

import mockupDashboard from "@/assets/landing/mockup-dashboard.png";
import mockupChat from "@/assets/landing/mockup-chat.png";
import mockupServices from "@/assets/landing/mockup-services.png";
import screenDashboard from "@/assets/landing/screen-dashboard.png";
import screenCrash from "@/assets/landing/screen-crash.png";
import screenRoadside from "@/assets/landing/screen-roadside.png";
import logoFull from "@/assets/landing/logo-full.png";

const font = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
};

/* ---------- helpers ---------- */
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
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
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ---------- iPhone-style frame ---------- */
const PhoneFrame: React.FC<{ src: string; alt: string; float?: boolean; className?: string }> = ({
  src,
  alt,
  float = true,
  className = "",
}) => {
  const Wrapper = float ? motion.div : ("div" as any);
  const wrapperProps = float
    ? {
        animate: { y: [0, -10, 0] },
        transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};
  return (
    <Wrapper {...wrapperProps} className={`relative mx-auto w-[260px] sm:w-[280px] ${className}`}>
      <div className="relative rounded-[42px] bg-neutral-900 p-[10px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.25)]">
        <div className="relative overflow-hidden rounded-[34px] bg-white">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
          <img src={src} alt={alt} className="block w-full" />
        </div>
      </div>
    </Wrapper>
  );
};

/* ---------- ornament divider ---------- */
const Ornament = () => (
  <div className="my-6 flex items-center justify-center text-blue-600/80" aria-hidden>
    <svg width="64" height="14" viewBox="0 0 64 14" fill="none">
      <path
        d="M2 7c6-6 10-6 14 0 4 6 8 6 14 0 4-3 6-3 8 0M32 7c4-3 6-3 8 0M40 7c6 6 10 6 14 0 4-3 6-3 8 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

/* ---------- store buttons ---------- */
const StoreButtons: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
    <a
      href="#"
      className="flex items-center gap-2 rounded-2xl bg-neutral-900 px-5 py-3 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <span className="text-sm font-semibold">App Store</span>
    </a>
    <a
      href="#"
      className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.38l2.584 1.574c.488.296.488 1.003 0 1.299l-2.584 1.573-2.543-2.543 2.543-2.544v.641zm-3.906-1.378L5.157 1.314l10.937 6.333-2.302 2.302z" />
      </svg>
      <span className="text-sm font-semibold">Google Play</span>
    </a>
  </div>
);

/* ---------- section block ---------- */
const FeatureBlock: React.FC<{
  title: React.ReactNode;
  description: string;
  image: string;
  alt: string;
}> = ({ title, description, image, alt }) => (
  <section className="px-5 py-14 sm:py-20">
    <div className="mx-auto max-w-2xl text-center">
      <FadeUp>
        <Ornament />
        <h2 className="text-2xl font-bold text-blue-600 sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
          {description}
        </p>
      </FadeUp>
      <ScaleIn delay={0.15} className="mt-10">
        <PhoneFrame src={image} alt={alt} />
      </ScaleIn>
    </div>
  </section>
);

/* ============== LANDING ============== */
const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900" style={font}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <img src={logoFull} alt="myAuto" className="h-7" />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-neutral-700 hover:bg-neutral-100"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-neutral-100 bg-white px-5 py-4">
            <nav className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-neutral-700">
              <a href="#about" onClick={() => setMenuOpen(false)}>О приложении</a>
              <a href="#features" onClick={() => setMenuOpen(false)}>Возможности</a>
              <a href="#download" onClick={() => setMenuOpen(false)}>Скачать</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="px-5 pt-10 pb-6 sm:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <FadeUp>
            <p className="text-[13px] uppercase tracking-[0.18em] text-neutral-400">
              AI — автосервис нового поколения — просто, умно, быстро
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-neutral-900 sm:text-5xl">
              Здесь начинается
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                цифровая жизнь
              </span>
              <br />
              твоего авто
            </h1>
          </FadeUp>
          <FadeUp delay={0.15} className="mt-8">
            <StoreButtons />
          </FadeUp>
          <ScaleIn delay={0.25} className="mt-12">
            <PhoneFrame src={mockupDashboard} alt="myAuto Dashboard" />
          </ScaleIn>
        </div>
      </section>

      {/* "Всё в одном приложении" intro */}
      <section id="about" className="px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <FadeUp>
            <Ornament />
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Всё в одном <span className="text-blue-600">приложении</span>
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-neutral-500">
              В myAuto+ есть всё. Быстрый доступ к качественным автоуслугам.
            </p>
          </FadeUp>
        </div>
      </section>

      <div id="features">
        <FeatureBlock
          title="Карточка здоровья"
          description="История, обслуживание, страховка и напоминания — всё в одной умной карточке."
          image={mockupDashboard}
          alt="Карточка здоровья"
        />

        <FeatureBlock
          title="Автосервисы"
          description="Нужный сервис — всегда под рукой."
          image={mockupServices}
          alt="Автосервисы"
        />

        <FeatureBlock
          title="Диагностика по фото"
          description="ИИ находит повреждения, оценивает ремонт, находит СТО. Точно и быстро."
          image={screenCrash}
          alt="Диагностика по фото"
        />

        <FeatureBlock
          title={<>AutoGPT — <span className="text-neutral-900">ИИ Чат</span></>}
          description="Подскажет, найдёт, посоветует. Подбор запчастей, рекомендации, советы по уходу — всегда на связи."
          image={mockupChat}
          alt="AutoGPT чат"
        />
      </div>

      {/* Доступно на всех платформах */}
      <section id="download" className="px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <FadeUp>
            <Ornament />
            <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              Доступно на всех платформах
            </h2>
            <p className="mt-3 text-[15px] text-neutral-500">
              Скачайте myAuto+ и добавьте авто в свой гараж
            </p>
          </FadeUp>
          <FadeUp delay={0.15} className="mt-7">
            <StoreButtons />
          </FadeUp>
          <ScaleIn delay={0.25} className="mt-12">
            <PhoneFrame src={screenDashboard} alt="myAuto" />
          </ScaleIn>
        </div>
      </section>

      {/* Blue CTA card */}
      <section className="px-5 pb-14">
        <FadeUp className="mx-auto max-w-2xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 p-7 text-center text-white shadow-[0_25px_50px_-15px_rgba(37,99,235,0.45)] sm:p-10">
            <p className="text-[15px] leading-relaxed text-white/90 sm:text-base">
              Попробуйте наше приложение уже сегодня и убедитесь сами,
              как просто управлять обслуживанием вашего автомобиля
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <a
                href="#download"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-600 shadow-sm transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Скачать приложение <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Стать партнёром
              </a>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start gap-3">
            <img src={logoFull} alt="myAuto" className="h-10" />
            <p className="max-w-sm text-sm text-neutral-500">
              Цифровой помощник для автовладельцев. Управляйте историей вашего автомобиля легко и удобно.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-neutral-900">Приложение</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#about" className="hover:text-blue-600">О нас</a></li>
                <li><a href="#features" className="hover:text-blue-600">Возможности</a></li>
                <li><a href="/privacy" className="hover:text-blue-600">Безопасность</a></li>
                <li><a href="#" className="hover:text-blue-600">Помощь</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-neutral-900">Партнёрам</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-blue-600">Для Инвесторов</a></li>
                <li><a href="#" className="hover:text-blue-600">Для СТО</a></li>
                <li><a href="#" className="hover:text-blue-600">Для Магазинов</a></li>
                <li><a href="#" className="hover:text-blue-600">Для Маляров</a></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="mb-3 text-sm font-semibold text-neutral-900">Контакты</h4>
              <ul className="space-y-2 text-sm text-neutral-500">
                <li><a href="mailto:info@myautoplus.kz" className="hover:text-blue-600">info@myautoplus.kz</a></li>
                <li><a href="tel:+77772373000" className="hover:text-blue-600">+7 (777) 237 30 00</a></li>
                <li>Казахстан, Астана</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-neutral-100 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center">
            <span>© myAuto+, 2025. Все права защищены.</span>
            <a href="/privacy" className="hover:text-blue-600">Политика конфиденциальности</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
