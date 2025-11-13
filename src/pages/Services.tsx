import { Menu, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.svg";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import NotificationBadge from "@/components/NotificationBadge";
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
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/roadside-help')}
        >
          <img src={roadsideHelpImg} alt={t('roadHelp')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('roadHelp')}</h3>
          </div>
        </Card>
        
        {/* Авто Форум */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/auto-forum')}
        >
          <img src={autoForumImg} alt={t('autoForum')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('autoForum')}</h3>
          </div>
        </Card>

        {/* Автосервисы */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/service-booking')}
        >
          <img src={autoServicesImg} alt={t('servicesTitle')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('servicesTitle')}</h3>
          </div>
        </Card>

        {/* Автомагазины */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/auto-shops')}
        >
          <img src={autoShopsImg} alt={t('autoShops')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('autoShops')}</h3>
          </div>
        </Card>

        {/* Детейлинг */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/detailing')}
        >
          <img src={detailingImg} alt={t('detailing')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('detailing')}</h3>
          </div>
        </Card>

        {/* Автомаляры */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/paint-shop')}
        >
          <img src={paintShopImg} alt={t('paintShop')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('paintShop')}</h3>
          </div>
        </Card>

        {/* Авторазборы */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/parts-dismantling')}
        >
          <img src={partsDismantlingImg} alt={t('partsDismantling')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('partsDismantling')}</h3>
          </div>
        </Card>

        {/* Автомойки */}
        <Card 
          className="aspect-square relative overflow-hidden border-white/20 hover:scale-105 transition-transform cursor-pointer"
          onClick={() => navigate('/car-wash')}
        >
          <img src={carWashImg} alt={t('carWash')} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h3 className="font-semibold text-white text-lg">{t('carWash')}</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Services;