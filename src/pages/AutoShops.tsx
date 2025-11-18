import { useState } from "react";
import { ArrowLeft, Store, MapPin, Star, Search, Phone, Package, Newspaper, Box, ArrowRight, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { StoriesCarousel } from "@/components/StoriesCarousel";
import autoShopImage from "@/assets/services/auto-shops.png";
import carCoveredImage from "@/assets/car-covered.png";

const AutoShops = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = usePersistedState("autoshops_search_query", "");

  const currentLang = localStorage.getItem('language') || 'ru';
  
  const stories = [
    {
      id: 0,
      title: t('autoShops.stories.news'),
      preview: autoShopImage,
      image: autoShopImage
    },
    {
      id: 1,
      title: t('autoShops.stories.promo'),
      preview: carCoveredImage,
      image: carCoveredImage
    },
    {
      id: 2,
      title: t('autoShops.stories.tips'),
      preview: autoShopImage,
      image: autoShopImage
    },
    {
      id: 3,
      title: t('autoShops.stories.reviews'),
      preview: carCoveredImage,
      image: carCoveredImage
    }
  ];

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
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('autoShops.title')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <StoriesCarousel stories={stories} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('autoShops.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card 
          className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => navigate('/parts-catalog')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h3 className="text-xl sm:text-2xl font-bold">{t('autoShops.catalog')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('autoShops.catalogSubtitle')}</p>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate('/news')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <Newspaper className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 flex items-center justify-center mb-2 sm:mb-3">
                  <div className="flex gap-1.5 sm:gap-2">
                    <Smartphone className="h-8 w-8 sm:h-12 sm:w-12 text-primary/40 transform -rotate-12" />
                    <Smartphone className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60 transform rotate-12" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1">{t('autoShops.news')}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('autoShops.newsSubtitle')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-600/10 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => navigate('/showroom-3d')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <Box className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 flex items-center justify-center mb-2 sm:mb-3">
                  <div className="relative">
                    <div className="w-12 h-6 sm:w-16 sm:h-8 bg-primary/30 rounded-lg shadow-lg" 
                         style={{ transform: 'perspective(100px) rotateY(-15deg)' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg" />
                      <div className="absolute bottom-1 left-2 right-2 h-2 bg-black/20 rounded" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1">{t('autoShops.showroom')}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('autoShops.showroomSubtitle')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-lg font-bold pt-2">
          {currentLang === 'kk' ? 'Жақын автодүкендер' : 'Автомагазины рядом'}
        </h2>

        {shops.map((shop) => (
          <Card key={shop.id} className="bg-card hover:bg-muted/30 transition-all cursor-pointer hover:shadow-md">
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
                  {shop.open ? (currentLang === 'kk' ? 'Ашық' : 'Открыто') : (currentLang === 'kk' ? 'Жабық' : 'Закрыто')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {currentLang === 'kk' ? shop.categoryKk : shop.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{shop.rating}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${shop.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    {currentLang === 'kk' ? 'Қоңырау шалу' : 'Позвонить'}
                  </Button>
                </a>
                <Button size="sm" className="flex-1">
                  {currentLang === 'kk' ? 'Бағыт' : 'Маршрут'}
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
