import { ArrowLeft, Recycle, Search, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const PartsDismantling = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const parts = [
    {
      id: 1,
      name: "Front Bumper",
      car: "Toyota Camry 2015",
      price: "18,000 ₸",
      condition: "Good"
    },
    {
      id: 2,
      name: "Headlight (Right)",
      car: "Honda Accord 2018",
      price: "12,000 ₸",
      condition: "Excellent"
    },
    {
      id: 3,
      name: "Engine 2.0L",
      car: "Mazda 6 2016",
      price: "250,000 ₸",
      condition: "Good"
    },
    {
      id: 4,
      name: "Transmission",
      car: "Nissan Altima 2017",
      price: "180,000 ₸",
      condition: "Fair"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('partsDismantling')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {parts.map((part) => (
            <Card key={part.id} className="bg-card hover:bg-accent transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{part.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{part.car}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Condition: {part.condition}</span>
                  <span className="font-bold text-primary">{part.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartsDismantling;