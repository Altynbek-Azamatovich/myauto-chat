import { ArrowLeft, Search, Package, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const PartsDismantling = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = usePersistedState("parts_dismantling_search_query", "");

  const parts = [
    {
      id: 1,
      name: "Передний бампер",
      car: "Toyota Camry 2015",
      price: "18,000 ₸",
      condition: "Хорошее",
      location: "2.5 км",
      phone: "+7 (777) 123-45-67"
    },
    {
      id: 2,
      name: "Фара (правая)",
      car: "Honda Accord 2018",
      price: "12,000 ₸",
      condition: "Отличное",
      location: "3.2 км",
      phone: "+7 (777) 234-56-78"
    },
    {
      id: 3,
      name: "Двигатель 2.0L",
      car: "Mazda 6 2016",
      price: "250,000 ₸",
      condition: "Хорошее",
      location: "5.1 км",
      phone: "+7 (777) 345-67-89"
    },
    {
      id: 4,
      name: "Коробка передач",
      car: "Nissan Altima 2017",
      price: "180,000 ₸",
      condition: "Удовлетворительное",
      location: "4.3 км",
      phone: "+7 (777) 456-78-90"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">{t('partsDismantling')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <ServiceUnderDevelopment />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchParts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 bg-muted/50 rounded-xl h-11"
          />
        </div>

        <div className="space-y-2">
          {parts.map((part) => (
            <div key={part.id} className="bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5">{part.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{part.car}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{part.location}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs py-0">{part.condition}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">{part.price}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Позвонить
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartsDismantling;
