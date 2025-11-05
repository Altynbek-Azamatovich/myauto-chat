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
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <ChevronLeft className="h-6 w-6 text-white" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-8 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <User className="h-6 w-6 text-white" />
        </Button>
      </header>

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