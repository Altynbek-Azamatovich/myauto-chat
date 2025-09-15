import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.png";

const Services = () => {
  const services = [
    { title: "Автосервисы", placeholder: true },
    { title: "Автомагазины", placeholder: true },
    { title: "Детейлинг", placeholder: true },
    { title: "Автомаляры", placeholder: true },
    { title: "Авторазборы", placeholder: true },
    { title: "Автомойки", placeholder: true },
    { title: "Аксессуары", placeholder: true },
    { title: "Химчистка", placeholder: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-8 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <User className="h-6 w-6" />
        </Button>
      </header>

      {/* Car Background */}
      <div className="px-4 py-6">
        <div className="h-48 bg-gradient-to-b from-muted to-transparent rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent"></div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="aspect-square p-4 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all cursor-pointer group"
            >
              <div className="h-full flex flex-col justify-between">
                {/* Placeholder for service image */}
                <div className="flex-1 bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="text-3xl mb-2">🔧</div>
                    <p className="text-xs">Загрузить изображение</p>
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-center group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;