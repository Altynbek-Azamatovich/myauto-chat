import { ArrowLeft, Store, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoShops = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const shops = [
    {
      id: 1,
      name: "AutoParts Pro",
      rating: 4.8,
      distance: "2.3 km",
      category: "Parts & Accessories",
      open: true
    },
    {
      id: 2,
      name: "Tire Center",
      rating: 4.6,
      distance: "3.1 km",
      category: "Tires",
      open: true
    },
    {
      id: 3,
      name: "Oil & Filters Shop",
      rating: 4.7,
      distance: "1.8 km",
      category: "Maintenance",
      open: false
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('autoShops')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {shops.map((shop) => (
          <Card key={shop.id} className="bg-card hover:bg-accent transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{shop.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {shop.distance}
                    </div>
                  </div>
                </div>
                <Badge variant={shop.open ? "default" : "secondary"}>
                  {shop.open ? "Open" : "Closed"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{shop.category}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{shop.rating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AutoShops;