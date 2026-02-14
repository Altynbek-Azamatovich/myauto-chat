import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Camera, MessageCircle, Car, Shield, Wrench, Paintbrush, ShoppingBag, Sparkles, MapPin, Phone, Mail, ChevronRight } from "lucide-react";

import mockupDashboard from "@/assets/landing/mockup-dashboard.png";
import mockupChat from "@/assets/landing/mockup-chat.png";
import mockupServices from "@/assets/landing/mockup-services.png";
import screenDashboard from "@/assets/landing/screen-dashboard.png";
import screenCrash from "@/assets/landing/screen-crash.png";
import screenRoadside from "@/assets/landing/screen-roadside.png";
import logoFull from "@/assets/landing/logo-full.png";

/* ──────── helpers ──────── */
const FadeUp = ({ children, className = "", delay = 0 }: {children: React.ReactNode;className?: string;delay?: number;}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>

      {children}
    </motion.div>);

};

const SlideIn = ({ children, className = "", delay = 0, direction = "left" }: {children: React.ReactNode;className?: string;delay?: number;direction?: "left" | "right";}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const x = direction === "left" ? -80 : 80;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>

      {children}
    </motion.div>);

};

const ScaleIn = ({ children, className = "", delay = 0 }: {children: React.ReactNode;className?: string;delay?: number;}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>

      {children}
    </motion.div>);

};

/* ──────── LANDING ──────── */
const Landing = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden selection:bg-amber-500/20 selection:text-amber-900 font-sans">

      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-32 overflow-hidden">
        {/* Subtle ambient */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber-100/40 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-100/30 blur-[100px] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Logo — 3x bigger */}
          <motion.img
            src={logoFull}
            alt="myAuto"
            className="h-36 md:h-48 mb-10"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }} />


          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}>

            <span className="text-gray-900">Здесь начинается</span>
            <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              цифровая жизнь
            </span>
            <br />
            <span className="text-gray-900">твоего авто</span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-base md:text-lg max-w-md mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}>
            AI-автосервис нового поколения
просто, умно, быстро.
          </motion.p>

          {/* Frameless screenshot */}
          <motion.div
            className="relative w-[280px] md:w-[320px]"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>

              <img src={mockupDashboard} alt="myAuto Dashboard" className="w-full rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Fixed CTAs */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white/95 to-transparent md:relative md:bg-transparent md:mt-12 md:p-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}>

          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <a href="#" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all shadow-lg">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </a>
            <a href="#" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.38l2.584 1.574c.488.296.488 1.003 0 1.299l-2.584 1.573-2.543-2.543 2.543-2.544v.641zm-3.906-1.378L5.157 1.314l10.937 6.333-2.302 2.302z" /></svg>
              Google Play
            </a>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FEATURE 1: AI DIAGNOSTICS ═══════════ */}
      <section className="relative py-24 md:py-36 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="md:flex md:items-center md:gap-20">
            <div className="md:flex-1">
              <FadeUp>
                <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">AI Diagnostics</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                  Диагностика{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">по фото</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-lg mb-8">
                  ИИ находит повреждения, оценивает ремонт и находит СТО. Просто наведи камеру.
                </p>
              </FadeUp>

              {/* Stats */}
              <FadeUp delay={0.2}>
                <div className="flex gap-8 mb-8 md:mb-0">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">2 сек</div>
                    <div className="text-xs text-gray-400">Время анализа</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">95%</div>
                    <div className="text-xs text-gray-400">Точность</div>
                  </div>
                </div>
              </FadeUp>
            </div>

            <SlideIn direction="right" delay={0.2} className="md:flex-1 flex justify-center">
              <div className="relative max-w-[300px] w-full">
                <img src={screenDashboard} alt="AI Scan" className="w-full rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]" />
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />


                {/* Floating badge */}
                <motion.div
                  className="absolute -right-4 md:-right-10 top-1/4 px-4 py-2 rounded-xl bg-white border border-gray-100 shadow-lg"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>

                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 text-xs font-semibold">Скан завершён</span>
                  </div>
                </motion.div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 2: AUTO-GPT ═══════════ */}
      <section className="relative py-24 md:py-36 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="md:flex md:items-center md:gap-20 md:flex-row-reverse">
            <div className="md:flex-1">
              <FadeUp>
                <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Smart Assistant</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                  Auto-GPT:{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Твой личный механик</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-lg mb-8">
                  Подскажет, найдёт запчасти, даст совет. Всегда на связи 24/7.
                </p>
              </FadeUp>

              {/* Chat bubbles */}
              <div className="space-y-3 mb-10 md:mb-0">
                <FadeUp delay={0.1}>
                  <div className="flex justify-end">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-md bg-amber-50 border border-amber-100 text-sm text-gray-700">
                      Привет, мне нужен передний бампер на мою машину
                    </div>
                  </div>
                </FadeUp>
                <FadeUp delay={0.3}>
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-md bg-gray-50 border border-gray-100 text-sm text-gray-600">
                      Привет! Я нашёл передний бампер на Toyota Camry 70.
                      <br /><span className="text-amber-600 font-semibold">Цена — 42 990 ₸</span>
                    </div>
                  </div>
                </FadeUp>
                <FadeUp delay={0.5}>
                  <div className="flex justify-start">
                    <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-md bg-gray-50 border border-gray-100 text-sm text-gray-600">
                      <span className="text-emerald-500">✓</span> Можно заказать прямо сейчас
                    </div>
                  </div>
                </FadeUp>
              </div>
            </div>

            <SlideIn direction="left" delay={0.2} className="md:flex-1 flex justify-center">
              <div className="relative w-[260px] md:w-[300px]">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>

                  <img src={mockupChat} alt="Auto-GPT Chat" className="w-full rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]" />
                </motion.div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 3: DIGITAL GARAGE ═══════════ */}
      <section className="relative py-24 md:py-36 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Digital Garage</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Всё в одном{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">приложении</span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-lg mb-12">
              История обслуживания, страховка, штрафы и напоминания. Умная карточка твоего авто.
            </p>
          </FadeUp>

          {/* Bento Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {[
            { icon: Car, label: "Мой гараж", desc: "Все авто в одном месте", bg: "bg-amber-50", iconColor: "text-amber-500" },
            { icon: Shield, label: "Страховка", desc: "Напоминания и полисы", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
            { icon: Wrench, label: "История ТО", desc: "Все записи сервиса", bg: "bg-blue-50", iconColor: "text-blue-500" },
            { icon: Camera, label: "AI-сканер", desc: "Диагностика по фото", bg: "bg-purple-50", iconColor: "text-purple-500" }].
            map((item, i) =>
            <ScaleIn key={item.label} delay={i * 0.1}>
                <div className={`relative rounded-2xl md:rounded-3xl p-5 md:p-6 ${item.bg} aspect-square flex flex-col justify-between group hover:shadow-lg transition-all duration-500`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor} group-hover:scale-110 transition-transform`} />
                  <div>
                    <div className="font-semibold text-sm md:text-base text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </ScaleIn>
            )}
          </div>

          {/* Crash analysis */}
          <FadeUp delay={0.3} className="mt-6 md:mt-8">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
                <div className="flex-1">
                  <div className="text-xs text-red-500 font-bold mb-2 tracking-wider uppercase">3D Реконструкция ДТП</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">Анализ аварий в реальном времени</h3>
                  <p className="text-gray-400 text-sm">Угол удара, сила столкновения, скорость — вся информация для страховой.</p>
                </div>
                <SlideIn direction="right" className="w-full md:w-[260px]">
                  <img src={screenCrash} alt="Crash Analysis" className="w-full rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)]" />
                </SlideIn>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════ ECOSYSTEM ═══════════ */}
      <section className="relative py-24 md:py-36 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <span className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-3 block">Ecosystem</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                Нужный сервис{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">всегда под рукой</span>
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                СТО, Детейлинг, Магазины, Тюнинг — всё в одной экосистеме.
              </p>
            </div>
          </FadeUp>

          {/* Horizontal scroll services - fast marquee */}
          <div className="relative mb-12 overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>

              {[...Array(2)].map((_, setIdx) =>
              <div key={setIdx} className="flex gap-4 flex-shrink-0">
                  {[
                { icon: Wrench, name: "Автосервисы", bg: "bg-amber-50", iconColor: "text-amber-500" },
                { icon: ShoppingBag, name: "Автомагазины", bg: "bg-blue-50", iconColor: "text-blue-500" },
                { icon: Paintbrush, name: "Детейлинг", bg: "bg-purple-50", iconColor: "text-purple-500" },
                { icon: Sparkles, name: "Автомаляры", bg: "bg-pink-50", iconColor: "text-pink-500" },
                { icon: Car, name: "Авторазборы", bg: "bg-emerald-50", iconColor: "text-emerald-500" },
                { icon: MapPin, name: "Автомойки", bg: "bg-cyan-50", iconColor: "text-cyan-500" }].
                map((svc) =>
                <div
                  key={`${setIdx}-${svc.name}`}
                  className="flex-shrink-0 w-[140px] md:w-[180px] rounded-2xl p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">

                      <div className={`w-12 h-12 rounded-xl ${svc.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <svc.icon className={`w-6 h-6 ${svc.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{svc.name}</span>
                    </div>
                )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Services mockup - frameless */}
          <ScaleIn className="flex justify-center">
            <div className="relative w-[260px] md:w-[300px]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>

                <img src={mockupServices} alt="Services" className="w-full rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]" />
              </motion.div>
            </div>
          </ScaleIn>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="relative py-24 px-4">
        <FadeUp>
          <div className="max-w-3xl mx-auto relative rounded-3xl overflow-hidden bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-emerald-500/10" />
            <div className="relative p-8 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Готов начать?
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Присоединяйся к тысячам водителей, которые уже используют myAuto+
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <a href="#" className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                  Скачать бесплатно
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-100 py-12 px-4 pb-32 md:pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <img src={logoFull} alt="myAuto" className="h-10 mb-4 opacity-70" />
              <div className="space-y-2 text-sm text-gray-400">
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
            <div className="flex gap-8 text-sm text-gray-400">
              <div className="space-y-2">
                <a href="#" className="block hover:text-gray-700 transition-colors">Для Инвесторов</a>
                <a href="#" className="block hover:text-gray-700 transition-colors">Партнёрам</a>
                <a href="/privacy-policy" className="block hover:text-gray-700 transition-colors">Политика конфиденциальности</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-300">
            © 2025 myAuto+. Все права защищены.
          </div>
        </div>
      </footer>
    </div>);

};

export default Landing;