import { useState } from "react";
import { ArrowLeft, Store, MapPin, Star, Search, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoShops = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const shops = [
    {
      id: 1,
      name: "AutoParts Pro",
      rating: 4.8,
      distance: "2.3 км",
      category: "Запчасти и аксессуары",
      categoryKk: "Бөлшектер мен аксессуарлар",
      open: true,
      phone: "+7 (777) 123-45-67"
    },
    {
      id: 2,
      name: "Tire Center Almaty",
      rating: 4.6,
      distance: "3.1 км",
      category: "Шины",
      categoryKk: "Шиналар",
      open: true,
      phone: "+7 (777) 234-56-78"
    },
    {
      id: 3,
      name: "Oil & Filters Kazakhstan",
      rating: 4.7,
      distance: "1.8 км",
      category: "Обслуживание",
      categoryKk: "Қызмет көрсету",
      open: false,
      phone: "+7 (777) 345-67-89"
    },
    {
      id: 4,
      name: "Battery Master",
      rating: 4.9,
      distance: "4.2 км",
      category: "Аккумуляторы",
      categoryKk: "Аккумуляторлар",
      open: true,
      phone: "+7 (777) 456-78-90"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('autoShops')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск автомагазинов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {shops.map((shop) => (
          <Card key={shop.id} className="bg-card hover:bg-accent transition-all cursor-pointer hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2 flex-1 min-w-0">
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{shop.distance}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={shop.open ? "default" : "secondary"} className="shrink-0">
                  {shop.open ? t('open') : t('closed')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shop.category}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{shop.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Позвонить
                </Button>
                <Button size="sm" className="flex-1">
                  Маршрут
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AutoShops;
