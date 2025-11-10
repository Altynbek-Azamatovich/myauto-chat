import { Menu, Bell, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo-new.png";
import { AppSidebar } from "@/components/AppSidebar";

const Services = () => {
  const navigate = useNavigate();
  const services = Array(8).fill(null);

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