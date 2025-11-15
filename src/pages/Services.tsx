import { useState, useEffect } from "react";
import { Menu, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-main.png";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBadge from "@/components/NotificationBadge";
import { supabase } from "@/integrations/supabase/client";
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

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-24">
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
  );
};

export default Services;