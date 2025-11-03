import { ChevronLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.png";

const Services = () => {
  const services = Array(8).fill(null);

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