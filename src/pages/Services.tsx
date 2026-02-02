import { useState, useEffect } from "react";
import { Menu, ShoppingCart, Package, Newspaper, Box, ArrowRight, Car, Wrench } from "lucide-react";
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
import roadsideHelpImg from "@/assets/services/roadside-help.png";
import autoForumImg from "@/assets/services/auto-forum.png";
import autoServicesImg from "@/assets/services/auto-services.png";
import autoShopsImg from "@/assets/services/auto-shops.png";
import detailingImg from "@/assets/services/detailing.png";
import paintShopImg from "@/assets/services/paint-shop.png";
import partsDismantlingImg from "@/assets/services/parts-dismantling.png";
import carWashImg from "@/assets/services/car-wash.png";

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
      icon: '📰'
    },
    {
      id: 1,
      title: t('storiesPromo'),
      preview: detailingImg,
      image: detailingImg,
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
      preview: paintShopImg,
      image: paintShopImg,
      icon: '⭐'
    }
  ];

  useEffect(() => {
    const checkHelpResponses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      const { count } = await supabase
        .from('help_responses')
        .select('*', { count: 'exact', head: true })
        .eq('help_request_id', myRequest.id);

      setHelpResponseCount(count || 0);
    };

    checkHelpResponses();

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
              <Menu className="h-[22px] w-[22px] text-foreground" strokeWidth={2.5} />
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
          <ShoppingCart className="h-[18px] w-[18px] text-foreground" strokeWidth={2.5} />
          <NotificationBadge count={itemCount} />
        </Button>
      </header>

      {/* Stories */}
      <div className="px-4 pb-4">
        <StoriesCarousel stories={stories} />
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-24 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Помощь на дороге */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/roadside-help')}
          >
            <img src={roadsideHelpImg} alt={t('roadHelp')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('roadHelp')}</h3>
            </div>
            {helpResponseCount > 0 && (
              <div className="absolute top-2 right-2">
                <NotificationBadge count={helpResponseCount} />
              </div>
            )}
          </Card>
          
          {/* Авто Форум */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/auto-forum')}
          >
            <img src={autoForumImg} alt={t('autoForum')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('autoForum')}</h3>
            </div>
          </Card>
        </div>

        {/* Каталог - Full Width */}
        <Card 
          className="bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10 hover:from-blue-500/15 hover:via-cyan-500/15 hover:to-teal-500/15 transition-all cursor-pointer border-0 rounded-2xl"
          onClick={() => navigate('/parts-catalog')}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{t('catalog')}</h3>
                  <p className="text-xs text-muted-foreground">{t('catalogSubtitle')}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>

        {/* Новости и 3D-Шоурум */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="aspect-[4/5] bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 hover:from-amber-500/15 hover:via-orange-500/15 hover:to-red-500/15 transition-all cursor-pointer border-0 rounded-2xl"
            onClick={() => navigate('/news')}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Newspaper className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-4xl">📰</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{t('news')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('newsSubtitle')}</p>
              </div>
            </div>
          </Card>

          <Card 
            className="aspect-[4/5] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 hover:from-purple-500/15 hover:via-pink-500/15 hover:to-rose-500/15 transition-all cursor-pointer border-0 rounded-2xl"
            onClick={() => navigate('/showroom-3d')}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <Box className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-4xl">🚗</div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{t('showroom3D')}</h3>
                <p className="text-[10px] text-muted-foreground">{t('showroomSubtitle')}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Автосервисы */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/service-booking')}
          >
            <img src={autoServicesImg} alt={t('servicesTitle')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('servicesTitle')}</h3>
            </div>
          </Card>

          {/* Автомагазины */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/auto-shops')}
          >
            <img src={autoShopsImg} alt={t('autoShops')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('autoShops')}</h3>
            </div>
          </Card>

          {/* Детейлинг */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/detailing')}
          >
            <img src={detailingImg} alt={t('detailing')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('detailing')}</h3>
            </div>
          </Card>

          {/* Автомаляры */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/paint-shop')}
          >
            <img src={paintShopImg} alt={t('paintShop')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('paintShop')}</h3>
            </div>
          </Card>

          {/* Разборки */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/parts-dismantling')}
          >
            <img src={partsDismantlingImg} alt={t('partsDismantling')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('partsDismantling')}</h3>
            </div>
          </Card>

          {/* Автомойки */}
          <Card 
            className="aspect-square relative overflow-hidden border-0 hover:scale-[1.02] transition-transform cursor-pointer rounded-2xl"
            onClick={() => navigate('/car-wash')}
          >
            <img src={carWashImg} alt={t('carWash')} className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('carWash')}</h3>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;
