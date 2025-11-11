import { Menu, ShoppingCart, Wrench, HelpCircle, MessageSquare, Store, Sparkles, Paintbrush, Recycle, Droplet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoImage from "@/assets/logo-new.png";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <AppSidebar 
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          }
        />

        <img src={logoImage} alt="myAuto" className="h-10 w-auto" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground relative"
          onClick={() => navigate('/service-cart')}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </header>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 pb-24">
        {/* Помощь на дороге */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/roadside-help')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <HelpCircle className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('roadHelp')}</h3>
          </CardContent>
        </Card>
        
        {/* Авто Форум */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/auto-forum')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('autoForum')}</h3>
          </CardContent>
        </Card>

        {/* Автосервисы */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/service-booking')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Wrench className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('servicesTitle')}</h3>
          </CardContent>
        </Card>

        {/* Автомагазины */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/auto-shops')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Store className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('autoShops')}</h3>
          </CardContent>
        </Card>

        {/* Детейлинг */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/detailing')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Sparkles className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('detailing')}</h3>
          </CardContent>
        </Card>

        {/* Автомаляры */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/paint-shop')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Paintbrush className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('paintShop')}</h3>
          </CardContent>
        </Card>

        {/* Авторазборы */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/parts-dismantling')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Recycle className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('partsDismantling')}</h3>
          </CardContent>
        </Card>

        {/* Автомойки */}
        <Card 
          className="aspect-square bg-card hover:bg-accent transition-colors cursor-pointer flex items-center justify-center"
          onClick={() => navigate('/car-wash')}
        >
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <Droplet className="h-12 w-12 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">{t('carWash')}</h3>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;