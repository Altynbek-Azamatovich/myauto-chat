import { useState } from "react";
import { ArrowLeft, Droplet, Clock, DollarSign, MapPin, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

const CarWash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("carwash_selected_service", null);

  const services = [
    {
      id: 1,
      name: "Экспресс мойка",
      nameKk: "Экспресс жуу",
      duration: "15 мин",
      durationKk: "15 мин",
      price: "2,000 ₸",
      description: "Быстрая наружная мойка",
      descriptionKk: "Жылдам сыртқы жуу",
      features: ["Мойка кузова", "Мойка дисков", "Сушка"]
    },
    {
      id: 2,
      name: "Стандартная мойка",
      nameKk: "Стандартты жуу",
      duration: "30 мин",
      durationKk: "30 мин",
      price: "3,500 ₸",
      description: "Наружная мойка + внутренняя уборка",
      descriptionKk: "Сыртқы жуу + ішкі тазалау",
      features: ["Всё из экспресс", "Уборка салона", "Протирка панелей"]
    },
    {
      id: 3,
      name: "Премиум мойка",
      nameKk: "Премиум жуу",
      duration: "1 час",
      durationKk: "1 сағат",
      price: "6,000 ₸",
      description: "Полная мойка с воском",
      descriptionKk: "Балаумен толық жуу",
      features: ["Всё из стандартной", "Восковое покрытие", "Чернение шин"]
    },
    {
      id: 4,
      name: "Делюкс пакет",
      nameKk: "Делюкс пакет",
      duration: "2 часа",
      durationKk: "2 сағат",
      price: "10,000 ₸",
      description: "Полная очистка внутри и снаружи",
      descriptionKk: "Ішінде және сыртында толық тазалау",
      features: ["Всё из премиум", "Химчистка салона", "Полировка кузова"]
    }
  ];

  const locations = [
    { id: 1, name: "City Center Wash", distance: "1.2 км", open: true },
    { id: 2, name: "Mall Parking Wash", distance: "2.5 км", open: true },
    { id: 3, name: "Highway Wash Station", distance: "4.3 км", open: false }
  ];

  const handleBook = (serviceId: number) => {
    setSelectedService(serviceId);
    toast.success("Услуга добавлена в корзину!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('carWash')}</h1>
      </header>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">{t('servicesLabel')}</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.id} className={`transition-all ${selectedService === service.id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Droplet className="h-6 w-6 text-primary" />
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

        <div>
          <h2 className="text-lg font-semibold mb-3">{t('nearbyLocations')}</h2>
          <div className="space-y-2">
            {locations.map((location) => (
              <Card key={location.id} className="bg-card hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.distance}</p>
                      </div>
                    </div>
                    <Badge variant={location.open ? "default" : "secondary"}>
                      {location.open ? t('open') : t('closed')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarWash;
