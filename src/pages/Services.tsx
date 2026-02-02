import { useState, useEffect } from "react";
import { Menu, ShoppingCart, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBadge from "@/components/NotificationBadge";
import { supabase } from "@/integrations/supabase/client";
import { StoriesCarousel } from "@/components/StoriesCarousel";
import { AutoForumMarquee } from "@/components/AutoForumMarquee";
import { RoadsideHelpCover } from "@/components/RoadsideHelpCover";
import autoServicesImg from "@/assets/services/auto-services.png";
import autoShopsImg from "@/assets/services/auto-shops.png";
import detailingImg from "@/assets/services/detailing.png";
import paintShopImg from "@/assets/services/paint-shop.png";
import partsDismantlingImg from "@/assets/services/parts-dismantling.png";
import carWashImg from "@/assets/services/car-wash.png";
import carCoveredImg from "@/assets/car-covered.png";
import showroomBg from "@/assets/showroom-bg.png";
import showroom3dBg from "@/assets/services/showroom-3d-new.png";
import newsBg from "@/assets/services/news-cover.png";

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
      image: autoShopsImg,
      icon: '📰',
      isStatic: true,
      customContent: {
        type: 'support' as const,
        title: 'Поддержите проект',
        subtitle: 'Помогите нам развивать myauto и делать его лучше для всех автолюбителей',
        buttonText: 'Поддержать проект',
        buttonUrl: 'https://kaspi.kz/pay/myauto'
      }
    },
    {
      id: 1,
      title: t('storiesPromo'),
      preview: carCoveredImg,
      image: carCoveredImg,
      icon: '🏷️'
    },
    {
      id: 2,
      title: t('storiesTips'),
      preview: autoServicesImg,
      image: autoServicesImg,
      icon: '💡'
    },
    {
      id: 3,
      title: t('storiesReviews'),
      preview: detailingImg,
      image: detailingImg,
      icon: '⭐'
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
              <Menu className="h-[30px] w-[30px] text-foreground" strokeWidth={2.5} />
            </Button>
          }
        />

        <Logo size="md" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground relative"
          onClick={() => navigate('/service-cart')}
        >
          <ShoppingCart className="h-[30px] w-[30px] text-foreground" strokeWidth={2.5} />
          <NotificationBadge count={itemCount} />
        </Button>
      </header>

      {/* Stories */}
      <div className="px-4 pb-4">
        <StoriesCarousel stories={stories} />
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-24 space-y-4">
        {/* Первый ряд: Помощь на дороге + Авто Форум */}
        <div className="grid grid-cols-2 gap-4">
          {/* Помощь на дороге */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/roadside-help')}
          >
            <RoadsideHelpCover />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('roadHelp')}</h3>
            </div>
            {helpResponseCount > 0 && (
              <div className="absolute top-2 right-2 z-10">
                <NotificationBadge count={helpResponseCount} />
              </div>
            )}
          </Card>
          
          {/* Авто Форум с анимированной обложкой */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/auto-forum')}
          >
            <AutoForumMarquee />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('autoForum')}</h3>
            </div>
          </Card>
        </div>

        {/* Новости и 3D-Шоурум */}
        <div className="grid grid-cols-2 gap-4">
          {/* Новости */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/news')}
          >
            <img 
              src={newsBg} 
              alt={t('news')} 
              className="absolute inset-0 w-full h-full object-contain brightness-90" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{t('news')}</h3>
              <p className="text-[10px] text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{t('newsSubtitle')}</p>
            </div>
          </Card>

          {/* 3D-Шоурум */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/showroom-3d')}
          >
            <img 
              src={showroom3dBg} 
              alt={t('showroom3D')} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{t('showroom3D')}</h3>
              <p className="text-[10px] text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{t('showroomSubtitle')}</p>
            </div>
          </Card>
        </div>

        {/* Автосервисы, Автомагазины, Детейлинг, Автомаляры, Разборки, Автомойки */}
        <div className="grid grid-cols-2 gap-4">
          {/* Автосервисы */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/service-booking')}
          >
            <img src={autoServicesImg} alt={t('servicesTitle')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('servicesTitle')}</h3>
            </div>
          </Card>

          {/* Автомагазины */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/auto-shops')}
          >
            <img src={autoShopsImg} alt={t('autoShops')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('autoShops')}</h3>
            </div>
          </Card>

          {/* Детейлинг */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/detailing')}
          >
            <img src={detailingImg} alt={t('detailing')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('detailing')}</h3>
            </div>
          </Card>

          {/* Автомаляры */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/paint-shop')}
          >
            <img src={paintShopImg} alt={t('paintShop')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('paintShop')}</h3>
            </div>
          </Card>

          {/* Разборки */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/parts-dismantling')}
          >
            <img src={partsDismantlingImg} alt={t('partsDismantling')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('partsDismantling')}</h3>
            </div>
          </Card>

          {/* Автомойки */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => navigate('/car-wash')}
          >
            <img src={carWashImg} alt={t('carWash')} className="absolute inset-0 w-full h-full object-cover object-top brightness-90" />
            <div className="absolute inset-0 bg-black/15" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{t('carWash')}</h3>
            </div>
          </Card>
        </div>

        {/* Каталог - Full Width - в самом низу */}
        <Card 
          className="relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer h-32"
          onClick={() => navigate('/parts-catalog')}
        >
          <img 
            src={showroomBg} 
            alt={t('catalog')} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="relative z-10 p-4 sm:p-6 h-full flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{t('catalog')}</h3>
              </div>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{t('catalogSubtitle')}</p>
            </div>
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white/80 flex-shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Services;