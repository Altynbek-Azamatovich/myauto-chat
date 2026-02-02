import { useState } from "react";
import { ArrowLeft, Droplet, Clock, MapPin, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

const CarWash = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("carwash_selected_service", null);

  const services = [
    {
      id: 1,
      name: { ru: "Экспресс мойка", kk: "Экспресс жуу", en: "Express Wash" },
      duration: { ru: "15 мин", kk: "15 мин", en: "15 min" },
      price: "2,000 ₸",
      description: { ru: "Быстрая наружная мойка", kk: "Жылдам сыртқы жуу", en: "Quick exterior wash" },
      features: { ru: ["Мойка кузова", "Мойка дисков", "Сушка"], kk: ["Кузовты жуу", "Дискілерді жуу", "Кептіру"], en: ["Body wash", "Wheel wash", "Drying"] }
    },
    {
      id: 2,
      name: { ru: "Стандартная мойка", kk: "Стандартты жуу", en: "Standard Wash" },
      duration: { ru: "30 мин", kk: "30 мин", en: "30 min" },
      price: "3,500 ₸",
      description: { ru: "Мойка + уборка салона", kk: "Жуу + салон тазалау", en: "Wash + interior vacuum" },
      features: { ru: ["Всё из экспресс", "Уборка салона", "Протирка панелей"], kk: ["Экспресс бәрі", "Салон тазалау", "Панельдерді сүрту"], en: ["All from express", "Interior vacuum", "Panel wipe"] }
    },
    {
      id: 3,
      name: { ru: "Премиум мойка", kk: "Премиум жуу", en: "Premium Wash" },
      duration: { ru: "1 час", kk: "1 сағат", en: "1 hour" },
      price: "6,000 ₸",
      description: { ru: "Полная мойка с воском", kk: "Балаумен толық жуу", en: "Full wash with wax" },
      features: { ru: ["Всё из стандартной", "Восковое покрытие", "Чернение шин"], kk: ["Стандарттың бәрі", "Балау жабыны", "Шиналарды қарайту"], en: ["All from standard", "Wax coating", "Tire shine"] }
    },
    {
      id: 4,
      name: { ru: "Делюкс пакет", kk: "Делюкс пакет", en: "Deluxe Package" },
      duration: { ru: "2 часа", kk: "2 сағат", en: "2 hours" },
      price: "10,000 ₸",
      description: { ru: "Полная очистка", kk: "Толық тазалау", en: "Complete cleaning" },
      features: { ru: ["Всё из премиум", "Химчистка салона", "Полировка кузова"], kk: ["Премиумның бәрі", "Салонды химиялық тазалау", "Кузовты жылтырату"], en: ["All from premium", "Cabin dry cleaning", "Body polish"] }
    }
  ];

  const locations = [
    { id: 1, name: "City Center Wash", distance: "1.2 km", open: true },
    { id: 2, name: "Mall Parking Wash", distance: "2.5 km", open: true },
    { id: 3, name: "Highway Wash Station", distance: "4.3 km", open: false }
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
          <h1 className="text-xl font-bold">{t('carWash')}</h1>
        </div>
      </header>

      <div className="px-4 space-y-6">
        <div>
          <p className="text-lg font-medium mb-3">{t('servicesLabel')}</p>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className={`p-5 rounded-2xl transition-all ${selectedService === service.id ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-muted/30'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Droplet className="h-5 w-5 text-primary" />
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

        <div>
          <p className="text-lg font-medium mb-3">{t('nearbyLocations')}</p>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.distance}</p>
                  </div>
                </div>
                <Badge variant={location.open ? "default" : "secondary"} className="rounded-full">
                  {location.open ? t('open') : t('closed')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarWash;
