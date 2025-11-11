import { useState } from "react";
import { ArrowLeft, Paintbrush, Clock, DollarSign, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { usePersistedState } from "@/hooks/usePersistedState";

const PaintShop = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedService, setSelectedService] = usePersistedState<number | null>("paintshop_selected_service", null);

  const services = [
    {
      id: 1,
      name: "Удаление царапин",
      nameKk: "Сызаттарды жою",
      duration: "2-3 часа",
      durationKk: "2-3 сағат",
      price: "8,000 ₸",
      description: "Удаление мелких царапин",
      descriptionKk: "Шағын сызаттарды жою",
      features: ["Локальная полировка", "Защитное покрытие", "Гарантия 6 месяцев"]
    },
    {
      id: 2,
      name: "Покраска панели",
      nameKk: "Панельді бояу",
      duration: "1 день",
      durationKk: "1 күн",
      price: "25,000 ₸",
      description: "Профессиональная покраска одной панели",
      descriptionKk: "Бір панельді кәсіби бояу",
      features: ["Подбор цвета", "Подготовка поверхности", "Покраска + лак"]
    },
    {
      id: 3,
      name: "Ремонт и покраска бампера",
      nameKk: "Бамперді жөндеу және бояу",
      duration: "2-3 дня",
      durationKk: "2-3 күн",
      price: "35,000 ₸",
      description: "Полная реставрация бампера",
      descriptionKk: "Бамперді толық қалпына келтіру",
      features: ["Ремонт трещин", "Выравнивание", "Полная покраска"]
    },
    {
      id: 4,
      name: "Полная покраска авто",
      nameKk: "Автокөлікті толық бояу",
      duration: "1 неделя",
      durationKk: "1 апта",
      price: "150,000 ₸",
      description: "Профессиональная полная покраска",
      descriptionKk: "Кәсіби толық бояу",
      features: ["Разборка элементов", "Полная покраска кузова", "Гарантия 2 года"]
    }
  ];

  const handleBook = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setSelectedService(serviceId);
    
    // Add to cart
    addToCart({
      id: `paint-${serviceId}`,
      name: service.name,
      price: parseInt(service.price.replace(/[^0-9]/g, '')),
      category: 'Автомаляры',
      partner_id: 'demo-partner-paint',
      partner_name: 'Автомаляры',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('paintShop')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {services.map((service) => (
          <Card key={service.id} className={`transition-all ${selectedService === service.id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Paintbrush className="h-6 w-6 text-primary" />
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

export default PaintShop;
