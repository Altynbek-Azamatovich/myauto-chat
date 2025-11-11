import { Menu, Bell, ShoppingCart, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-new.png";
import { AppSidebar } from "@/components/AppSidebar";
import { useLanguage } from "@/contexts/LanguageContext";

const Services = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const services = Array(7).fill(null);

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

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted/30 hover:text-foreground"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted/30 hover:text-foreground"
            onClick={() => navigate('/service-cart')}
          >
            <ShoppingCart className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Services Grid */}
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {/* Service Booking Card */}
          <Card 
            className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm hover:from-primary/30 hover:to-primary/10 transition-all cursor-pointer border-primary/30 flex flex-col items-center justify-center gap-3 p-4"
            onClick={() => navigate('/service-booking')}
          >
            <div className="bg-primary/20 p-4 rounded-full">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">
                {language === 'ru' ? 'Запись на СТО' : 'СТО-ға жазылу'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ru' ? 'Записаться на обслуживание' : 'Қызметке жазылу'}
              </p>
            </div>
          </Card>

          {services.map((_, index) => (
            <Card 
              key={index} 
              className="h-48 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;