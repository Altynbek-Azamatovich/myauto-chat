import { useState } from "react";
import { ArrowLeft, Sparkles, Clock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

const Detailing = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("detailing_selected_service", null);

  const services = [
    {
      id: 1,
      name: { ru: "Наружная детейлинг", kk: "Сыртқы детейлинг", en: "Exterior Detailing" },
      duration: { ru: "3-4 часа", kk: "3-4 сағат", en: "3-4 hours" },
      price: "15,000 ₸",
      description: { ru: "Полная наружная очистка", kk: "Толық сыртқы тазалау", en: "Full exterior cleaning" },
      features: {
        ru: ["Мойка кузова", "Полировка", "Защита покрытия"],
        kk: ["Кузовты жуу", "Жылтырату", "Жабынды қорғау"],
        en: ["Body wash", "Polishing", "Coating protection"]
      }
    },
    {
      id: 2,
      name: { ru: "Внутренняя детейлинг", kk: "Ішкі детейлинг", en: "Interior Detailing" },
      duration: { ru: "2-3 часа", kk: "2-3 сағат", en: "2-3 hours" },
      price: "12,000 ₸",
      description: { ru: "Глубокая внутренняя очистка", kk: "Терең ішкі тазалау", en: "Deep interior cleaning" },
      features: {
        ru: ["Химчистка салона", "Чистка обивки", "Обработка пластика"],
        kk: ["Салонды химиялық тазалау", "Жабынды тазалау", "Пластикті өңдеу"],
        en: ["Cabin dry cleaning", "Upholstery cleaning", "Plastic treatment"]
      }
    },
    {
      id: 3,
      name: { ru: "Полный детейлинг", kk: "Толық детейлинг", en: "Full Detailing" },
      duration: { ru: "5-6 часов", kk: "5-6 сағат", en: "5-6 hours" },
      price: "25,000 ₸",
      description: { ru: "Полная детейлинг", kk: "Толық детейлинг", en: "Complete detailing" },
      features: {
        ru: ["Наружная детейлинг", "Внутренняя детейлинг", "Обработка дисков"],
        kk: ["Сыртқы детейлинг", "Ішкі детейлинг", "Дискілерді өңдеу"],
        en: ["Exterior detailing", "Interior detailing", "Wheel treatment"]
      }
    },
    {
      id: 4,
      name: { ru: "Керамическое покрытие", kk: "Керамикалық жабын", en: "Ceramic Coating" },
      duration: { ru: "8-10 часов", kk: "8-10 сағат", en: "8-10 hours" },
      price: "45,000 ₸",
      description: { ru: "Профессиональное покрытие", kk: "Кәсіби жабын", en: "Professional coating" },
      features: {
        ru: ["Подготовка кузова", "Нанесение керамики", "Защита 2-3 года"],
        kk: ["Кузовты дайындау", "Керамика жағу", "2-3 жыл қорғаныс"],
        en: ["Body preparation", "Ceramic application", "2-3 year protection"]
      }
    }
  ];

  const inCartLabel = { ru: 'В корзине', kk: 'Себетте', en: 'In Cart' };

  const handleBook = (serviceId: number) => {
    setSelectedService(serviceId);
    toast.success(language === 'en' ? "Added to cart!" : language === 'kk' ? "Себетке қосылды!" : "Добавлено в корзину!");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/services')} className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </Button>
          <h1 className="text-xl font-bold">{t('detailing')}</h1>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {services.map((service) => (
          <div key={service.id} className={`p-5 rounded-2xl transition-all ${selectedService === service.id ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-muted/30'}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base">{service.name[language]}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{service.description[language]}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {service.features[language].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {service.duration[language]}
                </span>
                <span className="font-semibold text-primary">{service.price}</span>
              </div>
              <Button size="sm" className="rounded-xl h-9 px-4" onClick={() => handleBook(service.id)} variant={selectedService === service.id ? "secondary" : "default"}>
                {selectedService === service.id ? `${inCartLabel[language]} ✓` : t('book')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Detailing;
