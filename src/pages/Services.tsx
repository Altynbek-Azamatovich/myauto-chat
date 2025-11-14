import { Menu, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-main.png";
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
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100"
          onClick={() => navigate('/roadside-help')}
        >
          <img src={roadsideHelpImg} alt={t('roadHelp')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('roadHelp')}</h3>
          </div>
        </Card>
        
        {/* Авто Форум */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100"
          onClick={() => navigate('/auto-forum')}
        >
          <img src={autoForumImg} alt={t('autoForum')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('autoForum')}</h3>
          </div>
        </Card>

        {/* Автосервисы */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-indigo-50 to-indigo-100"
          onClick={() => navigate('/service-booking')}
        >
          <img src={autoServicesImg} alt={t('servicesTitle')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('servicesTitle')}</h3>
          </div>
        </Card>

        {/* Автомагазины */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100"
          onClick={() => navigate('/auto-shops')}
        >
          <img src={autoShopsImg} alt={t('autoShops')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('autoShops')}</h3>
          </div>
        </Card>

        {/* Детейлинг */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-pink-50 to-pink-100"
          onClick={() => navigate('/detailing')}
        >
          <img src={detailingImg} alt={t('detailing')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('detailing')}</h3>
          </div>
        </Card>

        {/* Автомаляры */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100"
          onClick={() => navigate('/paint-shop')}
        >
          <img src={paintShopImg} alt={t('paintShop')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('paintShop')}</h3>
          </div>
        </Card>

        {/* Разборки */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100"
          onClick={() => navigate('/parts-dismantling')}
        >
          <img src={partsDismantlingImg} alt={t('partsDismantling')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('partsDismantling')}</h3>
          </div>
        </Card>

        {/* Автомойки */}
        <Card 
          className="h-48 relative overflow-hidden border-0 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-cyan-50 to-cyan-100"
          onClick={() => navigate('/car-wash')}
        >
          <img src={carWashImg} alt={t('carWash')} className="w-full h-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-semibold text-sm drop-shadow-lg">{t('carWash')}</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Services;