import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Camera, MessageCircle, Car, Shield, Wrench, Paintbrush, ShoppingBag, Sparkles, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

import mockupDashboard from "@/assets/landing/mockup-dashboard.png";
import mockupChat from "@/assets/landing/mockup-chat.png";
import mockupServices from "@/assets/landing/mockup-services.png";
import screenDashboard from "@/assets/landing/screen-dashboard.png";
import screenCrash from "@/assets/landing/screen-crash.png";
import logoFull from "@/assets/landing/logo-full.png";

/* ──────── helpers ──────── */
const FadeUp = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ──────── LANDING ──────── */
const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="bg-[#050505] text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-white font-sans">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "256px" }} />

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-amber-500/[0.07] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.05] blur-[100px] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Logo */}
          <motion.img
            src={logoFull}
            alt="myAuto"
            className="h-12 md:h-16 mb-8 drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              Здесь начинается
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              цифровая жизнь
            </span>
            <br />
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              твоего авто
            </span>
          </motion.h1>

          <motion.p
            className="text-white/50 text-base md:text-lg max-w-md mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            AI-автосервис нового поколения: просто, умно, быстро.
          </motion.p>

          {/* Phone mockup */}
          <motion.div
            className="relative w-[260px] md:w-[300px]"
            initial={{ opacity: 0, y: 60, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Glow behind phone */}
            <div className="absolute inset-0 -z-10 scale-110 blur-[60px] bg-gradient-to-b from-amber-500/20 via-transparent to-emerald-500/10 rounded-full" />

            {/* Phone frame */}
            <div className="relative rounded-[2.5rem] overflow-hidden border-[3px] border-white/10 shadow-[0_0_80px_rgba(245,158,11,0.15),0_30px_60px_-15px_rgba(0,0,0,0.7)]">
              <img src={mockupDashboard} alt="myAuto Dashboard" className="w-full" />
            </div>

            {/* Floating animation */}
            <motion.div
              className="absolute inset-0"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Fixed CTAs at bottom for mobile */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent md:relative md:bg-transparent md:mt-12 md:p-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <a href="#" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </a>
            <a href="#" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 border border-white/15 text-white font-semibold text-sm hover:bg-white/15 transition-all backdrop-blur-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.38l2.584 1.574c.488.296.488 1.003 0 1.299l-2.584 1.573-2.543-2.543 2.543-2.544v.641zm-3.906-1.378L5.157 1.314l10.937 6.333-2.302 2.302z" /></svg>
              Google Play
            </a>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FEATURE 1: AI DIAGNOSTICS ═══════════ */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-amber-500 to-transparent" />
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">AI Diagnostics</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Диагностика{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">по фото</span>
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-lg mb-12">
              ИИ находит повреждения, оценивает ремонт и находит СТО. Просто наведи камеру.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="relative max-w-sm mx-auto">
              {/* Scan card */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent shadow-2xl">
                <img src={screenDashboard} alt="AI Scan" className="w-full" />
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -right-2 md:-right-8 top-1/4 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">Скан завершён</span>
                </div>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ FEATURE 2: AUTO-GPT ═══════════ */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="md:flex md:items-center md:gap-16">
            <div className="md:flex-1">
              <FadeUp>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-amber-500 to-transparent" />
                  <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Smart Assistant</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Auto-GPT:{" "}
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Твой личный механик</span>
                </h2>
                <p className="text-white/40 text-base md:text-lg max-w-lg mb-8">
                  Подскажет, найдёт запчасти, даст совет. Всегда на связи 24/7.
                </p>
              </FadeUp>

              {/* Chat bubbles */}
              <div className="space-y-3 mb-8 md:mb-0">
                <FadeUp delay={0.1}>
                  <div className="flex justify-end">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-md bg-amber-500/20 border border-amber-500/20 text-sm text-white/80">
                      Привет, мне нужен передний бампер на мою машину
                    </div>
                  </div>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/10 text-sm text-white/70">
                      Привет! Я нашёл передний бампер на Toyota Camry 70.
                      <br /><span className="text-amber-400 font-semibold">Цена — 42 990 ₸</span>
                    </div>
                  </div>
                </FadeUp>
                <FadeUp delay={0.5}>
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/10 text-sm text-white/70">
                      <span className="text-emerald-400">✓</span> Можно заказать прямо сейчас
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>

            <FadeUp delay={0.2} className="md:flex-1 flex justify-center">
              <div className="relative w-[240px] md:w-[280px]">
                <div className="absolute inset-0 -z-10 scale-110 blur-[50px] bg-gradient-to-b from-blue-500/10 via-transparent to-amber-500/10 rounded-full" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="rounded-[2.5rem] overflow-hidden border-[3px] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                    <img src={mockupChat} alt="Auto-GPT Chat" className="w-full" />
                  </div>
                </motion.div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 3: DIGITAL GARAGE ═══════════ */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-amber-500 to-transparent" />
              <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Digital Garage</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Всё в одном{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">приложении</span>
            </h2>
            <p className="text-white/40 text-base md:text-lg max-w-lg mb-12">
              История обслуживания, страховка, штрафы и напоминания. Умная карточка твоего авто.
            </p>
          </FadeUp>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
              { icon: Car, label: "Мой гараж", desc: "Все авто в одном месте", color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400" },
              { icon: Shield, label: "Страховка", desc: "Напоминания и полисы", color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400" },
              { icon: Wrench, label: "История ТО", desc: "Все записи сервиса", color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400" },
              { icon: Camera, label: "AI-сканер", desc: "Диагностика по фото", color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400" },
            ].map((item, i) => (
              <FadeUp key={item.label} delay={i * 0.1}>
                <div className={`relative rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/[0.06] bg-gradient-to-br ${item.color} backdrop-blur-sm aspect-square flex flex-col justify-between group hover:border-white/15 transition-all duration-500`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor} group-hover:scale-110 transition-transform`} />
                  <div>
                    <div className="font-semibold text-sm md:text-base text-white/90">{item.label}</div>
                    <div className="text-xs text-white/35 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* 3D accident mockup */}
          <FadeUp delay={0.3} className="mt-6 md:mt-8">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.06] bg-gradient-to-br from-red-500/10 to-transparent">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
                <div className="flex-1">
                  <div className="text-xs text-red-400 font-semibold mb-2 tracking-wider">3D РЕКОНСТРУКЦИЯ ДТП</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Анализ аварий в реальном времени</h3>
                  <p className="text-white/40 text-sm">Угол удара, сила столкновения, скорость — вся информация для страховой.</p>
                </div>
                <div className="w-full md:w-[260px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img src={screenCrash} alt="Crash Analysis" className="w-full" />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ ECOSYSTEM ═══════════ */}
      <section className="relative py-24 md:py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-[40px] bg-gradient-to-r from-transparent to-amber-500" />
                <span className="text-amber-500 text-xs font-semibold tracking-[0.2em] uppercase">Ecosystem</span>
                <div className="h-px w-[40px] bg-gradient-to-l from-transparent to-amber-500" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Нужный сервис{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">всегда под рукой</span>
              </h2>
              <p className="text-white/40 max-w-md mx-auto">
                СТО, Детейлинг, Магазины, Тюнинг — всё в одной экосистеме.
              </p>
            </div>
          </FadeUp>

          {/* Horizontal scroll services */}
          <FadeUp delay={0.2}>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              {[
                { icon: Wrench, name: "Автосервисы", color: "amber" },
                { icon: ShoppingBag, name: "Автомагазины", color: "blue" },
                { icon: Paintbrush, name: "Детейлинг", color: "purple" },
                { icon: Sparkles, name: "Автомаляры", color: "pink" },
                { icon: Car, name: "Авторазборы", color: "emerald" },
                { icon: MapPin, name: "Автомойки", color: "cyan" },
              ].map((svc) => (
                <div
                  key={svc.name}
                  className="flex-shrink-0 snap-center w-[140px] md:w-[180px] rounded-2xl p-5 border border-white/[0.06] bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] hover:border-white/15 transition-all duration-500 group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${svc.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <svc.icon className={`w-6 h-6 text-${svc.color}-400`} />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">{svc.name}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          {/* Services mockup */}
          <FadeUp delay={0.3} className="mt-12 flex justify-center">
            <div className="relative w-[240px] md:w-[280px]">
              <div className="absolute inset-0 -z-10 scale-110 blur-[50px] bg-gradient-to-b from-amber-500/10 via-transparent to-emerald-500/10 rounded-full" />
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="rounded-[2.5rem] overflow-hidden border-[3px] border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                  <img src={mockupServices} alt="Services" className="w-full" />
                </div>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="relative py-24 px-4">
        <FadeUp>
          <div className="max-w-3xl mx-auto relative rounded-3xl overflow-hidden border border-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-[#050505] to-emerald-500/5" />
            <div className="relative p-8 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Готов начать?
              </h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Присоединяйся к тысячам водителей, которые уже используют myAuto+
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <a href="#" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                  Скачать бесплатно
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-white/[0.06] py-12 px-4 pb-32 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <img src={logoFull} alt="myAuto" className="h-8 mb-4 brightness-0 invert opacity-60" />
              <div className="space-y-2 text-sm text-white/30">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  info@myautoplus.kz
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +7 (777) 237-30-00
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Астана, Казахстан
                </div>
              </div>
            </div>
            <div className="flex gap-8 text-sm text-white/30">
              <div className="space-y-2">
                <a href="#" className="block hover:text-white/60 transition-colors">Для Инвесторов</a>
                <a href="#" className="block hover:text-white/60 transition-colors">Партнёрам</a>
                <a href="/privacy-policy" className="block hover:text-white/60 transition-colors">Политика конфиденциальности</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-white/20">
            © 2025 myAuto+. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
