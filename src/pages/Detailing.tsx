import { useState } from "react";
import { ArrowLeft, Sparkles, Clock, DollarSign, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

const Detailing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("detailing_selected_service", null);

  const services = [
    {
      id: 1,
      name: "Наружная детейлинг",
      nameKk: "Сыртқы детейлинг",
      duration: "3-4 часа",
      durationKk: "3-4 сағат",
      price: "15,000 ₸",
      description: "Полная наружная очистка и полировка",
      descriptionKk: "Толық сыртқы тазалау және жылтырату",
      features: ["Мойка кузова", "Полировка", "Защита лакокрасочного покрытия"]
    },
    {
      id: 2,
      name: "Внутренняя детейлинг",
      nameKk: "Ішкі детейлинг",
      duration: "2-3 часа",
      durationKk: "2-3 сағат",
      price: "12,000 ₸",
      description: "Глубокая внутренняя очистка",
      descriptionKk: "Терең ішкі тазалау",
      features: ["Химчистка салона", "Чистка обивки", "Обработка пластика"]
    },
    {
      id: 3,
      name: "Полный детейлинг",
      nameKk: "Толық детейлинг",
      duration: "5-6 часов",
      durationKk: "5-6 сағат",
      price: "25,000 ₸",
      description: "Полная внутренняя и наружная детейлинг",
      descriptionKk: "Толық ішкі және сыртқы детейлинг",
      features: ["Всё из наружной детейлинг", "Всё из внутренней детейлинг", "Обработка дисков"]
    },
    {
      id: 4,
      name: "Керамическое покрытие",
      nameKk: "Керамикалық жабын",
      duration: "8-10 часов",
      durationKk: "8-10 сағат",
      price: "45,000 ₸",
      description: "Профессиональное керамическое покрытие",
      descriptionKk: "Кәсіби керамикалық жабын",
      features: ["Подготовка кузова", "Нанесение керамики", "Защита на 2-3 года"]
    }
  ];

  const handleBook = (serviceId: number) => {
    setSelectedService(serviceId);
    toast.success("Услуга добавлена в корзину!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('detailing')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {services.map((service) => (
          <Card key={service.id} className={`transition-all ${selectedService === service.id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary text-lg">
                    {service.price}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleBook(service.id)}
                  variant={selectedService === service.id ? "secondary" : "default"}
                >
                  {selectedService === service.id ? "В корзине ✓" : t('book')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Detailing;
