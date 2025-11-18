import { useState, useEffect } from "react";
import { Menu, ShoppingCart, Package, Newspaper, Box, ArrowRight, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-main.png";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBadge from "@/components/NotificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { StoriesCarousel } from "@/components/StoriesCarousel";
import roadsideHelpImg from "@/assets/services/roadside-help.png";
import autoForumImg from "@/assets/services/auto-forum.png";
import autoServicesImg from "@/assets/services/auto-services.png";
import autoShopsImg from "@/assets/services/auto-shops.png";
import detailingImg from "@/assets/services/detailing.png";
import paintShopImg from "@/assets/services/paint-shop.png";
import partsDismantlingImg from "@/assets/services/parts-dismantling.png";
import carWashImg from "@/assets/services/car-wash.png";
import carCoveredImg from "@/assets/car-covered.png";

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const [helpResponseCount, setHelpResponseCount] = useState(0);

  const stories = [
    {
      id: 0,
      title: t('storiesNews'),
      preview: autoShopsImg,
      image: autoShopsImg
    },
    {
      id: 1,
      title: t('storiesPromo'),
      preview: carCoveredImg,
      image: carCoveredImg
    },
    {
      id: 2,
      title: t('storiesTips'),
      preview: autoServicesImg,
      image: autoServicesImg
    },
    {
      id: 3,
      title: t('storiesReviews'),
      preview: detailingImg,
      image: detailingImg
    }
  ];

  useEffect(() => {
    const checkHelpResponses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Проверяем есть ли активный запрос помощи у пользователя
      const { data: myRequest } = await supabase
        .from('help_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!myRequest) {
        setHelpResponseCount(0);
        return;
      }

      // Считаем количество откликов на запрос
      const { count } = await supabase
        .from('help_responses')
        .select('*', { count: 'exact', head: true })
        .eq('help_request_id', myRequest.id);

      setHelpResponseCount(count || 0);
    };

    checkHelpResponses();

    // Подписываемся на новые отклики
    const channel = supabase
      .channel('help-responses-for-services')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'help_responses'
        },
        () => {
          checkHelpResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <AppSidebar 
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-8 w-8" />
            </Button>
          }
        />

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground relative"
          onClick={() => navigate('/service-cart')}
        >
          <ShoppingCart className="h-8 w-8" />
          <NotificationBadge count={itemCount} />
        </Button>
      </header>

      {/* Stories */}
      <div className="px-4 pb-4">
        <StoriesCarousel stories={stories} />
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-4">
        {/* Помощь на дороге */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/roadside-help')}
        >
          <img src={roadsideHelpImg} alt={t('roadHelp')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('roadHelp')}</h3>
          </div>
          {helpResponseCount > 0 && (
            <div className="absolute top-2 right-2">
              <NotificationBadge count={helpResponseCount} />
            </div>
          )}
        </Card>
        
        {/* Авто Форум */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/auto-forum')}
        >
          <img src={autoForumImg} alt={t('autoForum')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('autoForum')}</h3>
          </div>
        </Card>
        </div>

        {/* Каталог - Full Width */}
        <Card 
          className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 hover:shadow-lg transition-all cursor-pointer border-0"
          onClick={() => navigate('/parts-catalog')}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">{t('catalog')}</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('catalogSubtitle')}</p>
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Новости и 3D-Шоурум */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 hover:shadow-lg transition-all cursor-pointer border-0"
            onClick={() => navigate('/news')}
          >
            <div className="p-4 sm:p-6">
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
                  <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1 text-foreground">{t('news')}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('newsSubtitle')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-600/10 hover:shadow-lg transition-all cursor-pointer border-0"
            onClick={() => navigate('/showroom-3d')}
          >
            <div className="p-4 sm:p-6">
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
                  <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1 text-foreground">{t('showroom3D')}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{t('showroomSubtitle')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">

        {/* Автосервисы */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/service-booking')}
        >
          <img src={autoServicesImg} alt={t('servicesTitle')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('servicesTitle')}</h3>
          </div>
        </Card>

        {/* Автомагазины */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/auto-shops')}
        >
          <img src={autoShopsImg} alt={t('autoShops')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('autoShops')}</h3>
          </div>
        </Card>

        {/* Детейлинг */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/detailing')}
        >
          <img src={detailingImg} alt={t('detailing')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('detailing')}</h3>
          </div>
        </Card>

        {/* Автомаляры */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/paint-shop')}
        >
          <img src={paintShopImg} alt={t('paintShop')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('paintShop')}</h3>
          </div>
        </Card>

        {/* Разборки */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/parts-dismantling')}
        >
          <img src={partsDismantlingImg} alt={t('partsDismantling')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('partsDismantling')}</h3>
          </div>
        </Card>

        {/* Автомойки */}
        <Card 
          className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gray-100 dark:bg-gray-800"
          onClick={() => navigate('/car-wash')}
        >
          <img src={carWashImg} alt={t('carWash')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('carWash')}</h3>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;