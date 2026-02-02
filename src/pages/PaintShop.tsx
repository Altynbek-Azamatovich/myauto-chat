import { useState } from "react";
import { ArrowLeft, Paintbrush, Clock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const PaintShop = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("paintshop_selected_service", null);

  const services = [
    {
      id: 1,
      name: { ru: "Удаление царапин", kk: "Сызаттарды жою", en: "Scratch Removal" },
      duration: { ru: "2-3 часа", kk: "2-3 сағат", en: "2-3 hours" },
      price: "8,000 ₸",
      description: { ru: "Удаление мелких царапин", kk: "Шағын сызаттарды жою", en: "Minor scratch removal" },
      features: {
        ru: ["Локальная полировка", "Защитное покрытие", "Гарантия 6 месяцев"],
        kk: ["Жергілікті жылтырату", "Қорғаныш жабыны", "6 ай кепілдік"],
        en: ["Local polishing", "Protective coating", "6 month warranty"]
      }
    },
    {
      id: 2,
      name: { ru: "Покраска панели", kk: "Панельді бояу", en: "Panel Painting" },
      duration: { ru: "1 день", kk: "1 күн", en: "1 day" },
      price: "25,000 ₸",
      description: { ru: "Профессиональная покраска одной панели", kk: "Бір панельді кәсіби бояу", en: "Professional single panel painting" },
      features: {
        ru: ["Подбор цвета", "Подготовка поверхности", "Покраска + лак"],
        kk: ["Түс таңдау", "Беткі қабатты дайындау", "Бояу + лак"],
        en: ["Color matching", "Surface preparation", "Paint + clear coat"]
      }
    },
    {
      id: 3,
      name: { ru: "Ремонт и покраска бампера", kk: "Бамперді жөндеу және бояу", en: "Bumper Repair & Paint" },
      duration: { ru: "2-3 дня", kk: "2-3 күн", en: "2-3 days" },
      price: "35,000 ₸",
      description: { ru: "Полная реставрация бампера", kk: "Бамперді толық қалпына келтіру", en: "Complete bumper restoration" },
      features: {
        ru: ["Ремонт трещин", "Выравнивание", "Полная покраска"],
        kk: ["Жарықтарды жөндеу", "Түзету", "Толық бояу"],
        en: ["Crack repair", "Leveling", "Full paint"]
      }
    },
    {
      id: 4,
      name: { ru: "Полная покраска авто", kk: "Автокөлікті толық бояу", en: "Full Car Repaint" },
      duration: { ru: "1 неделя", kk: "1 апта", en: "1 week" },
      price: "150,000 ₸",
      description: { ru: "Профессиональная полная покраска", kk: "Кәсіби толық бояу", en: "Professional full repaint" },
      features: {
        ru: ["Разборка элементов", "Полная покраска кузова", "Гарантия 2 года"],
        kk: ["Элементтерді бөлшектеу", "Кузовты толық бояу", "2 жыл кепілдік"],
        en: ["Element disassembly", "Full body paint", "2 year warranty"]
      }
    }
  ];

  const handleBook = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setSelectedService(serviceId);
    
    addToCart({
      id: `paint-${serviceId}`,
      name: service.name[language],
      price: parseInt(service.price.replace(/[^0-9]/g, '')),
      category: t('paintShop'),
      partner_id: 'demo-partner-paint',
      partner_name: t('paintShop'),
    });
  };

  const inCartLabel = { ru: 'В корзине', kk: 'Себетте', en: 'In Cart' };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/services')}
            className="rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </Button>
          <h1 className="text-xl font-bold">{t('paintShop')}</h1>
        </div>
      </header>

      {/* Services List */}
      <div className="px-4 space-y-4">
        <ServiceUnderDevelopment />
        
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`p-5 rounded-2xl transition-all ${
              selectedService === service.id 
                ? 'bg-primary/5 ring-1 ring-primary/20' 
                : 'bg-muted/30'
            }`}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Paintbrush className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base">{service.name[language]}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{service.description[language]}</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-4">
              {service.features[language].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {service.duration[language]}
                </span>
                <span className="font-semibold text-primary">
                  {service.price}
                </span>
              </div>
              <Button 
                size="sm"
                className="rounded-xl h-9 px-4"
                onClick={() => handleBook(service.id)}
                variant={selectedService === service.id ? "secondary" : "default"}
              >
                {selectedService === service.id ? `${inCartLabel[language]} ✓` : t('book')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaintShop;
