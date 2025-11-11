import { ArrowLeft, Droplet, Clock, DollarSign, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const CarWash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    {
      id: 1,
      name: "Express Wash",
      duration: "15 min",
      price: "2,000 ₸",
      description: "Quick exterior wash"
    },
    {
      id: 2,
      name: "Standard Wash",
      duration: "30 min",
      price: "3,500 ₸",
      description: "Exterior wash + interior vacuum"
    },
    {
      id: 3,
      name: "Premium Wash",
      duration: "1 hour",
      price: "6,000 ₸",
      description: "Full service wash with waxing"
    },
    {
      id: 4,
      name: "Deluxe Package",
      duration: "2 hours",
      price: "10,000 ₸",
      description: "Complete cleaning inside and out"
    }
  ];

  const locations = [
    { id: 1, name: "City Center Wash", distance: "1.2 km", open: true },
    { id: 2, name: "Mall Parking Wash", distance: "2.5 km", open: true },
    { id: 3, name: "Highway Wash Station", distance: "4.3 km", open: false }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('carWash')}</h1>
      </header>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Services</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <Card key={service.id} className="bg-card hover:bg-accent transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Droplet className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.duration}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        {service.price}
                      </span>
                    </div>
                    <Button size="sm">Book</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Nearby Locations</h2>
          <div className="space-y-2">
            {locations.map((location) => (
              <Card key={location.id} className="bg-card">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{location.name}</p>
                        <p className="text-xs text-muted-foreground">{location.distance}</p>
                      </div>
                    </div>
                    <Badge variant={location.open ? "default" : "secondary"}>
                      {location.open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarWash;