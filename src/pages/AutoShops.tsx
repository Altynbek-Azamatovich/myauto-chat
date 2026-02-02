import { useState } from "react";
import { ArrowLeft, Store, MapPin, Star, Search, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const AutoShops = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = usePersistedState("autoshops_search_query", "");

  const shops = [
    {
      id: 1,
      name: "AutoParts Pro",
      rating: 4.8,
      distance: "2.3 км",
      category: "Запчасти и аксессуары",
      open: true,
      phone: "+7 (777) 123-45-67"
    },
    {
      id: 2,
      name: "Tire Center Almaty",
      rating: 4.6,
      distance: "3.1 км",
      category: "Шины",
      open: true,
      phone: "+7 (777) 234-56-78"
    },
    {
      id: 3,
      name: "Oil & Filters Kazakhstan",
      rating: 4.7,
      distance: "1.8 км",
      category: "Масла и фильтры",
      open: false,
      phone: "+7 (777) 345-67-89"
    },
    {
      id: 4,
      name: "Battery Master",
      rating: 4.9,
      distance: "4.2 км",
      category: "Аккумуляторы",
      open: true,
      phone: "+7 (777) 456-78-90"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">{t('autoShops')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <ServiceUnderDevelopment />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск магазинов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 bg-muted/50 rounded-xl h-11"
          />
        </div>

        <div className="space-y-2">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate">{shop.name}</h3>
                    <Badge variant={shop.open ? "default" : "secondary"} className="shrink-0 text-xs">
                      {shop.open ? (language === 'kk' ? 'Ашық' : 'Открыто') : (language === 'kk' ? 'Жабық' : 'Закрыто')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{shop.category}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shop.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {shop.rating}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${shop.phone}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-9 rounded-xl text-xs">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        Позвонить
                      </Button>
                    </a>
                    <Button size="sm" className="flex-1 h-9 rounded-xl text-xs">
                      Маршрут
                    </Button>
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

export default AutoShops;
