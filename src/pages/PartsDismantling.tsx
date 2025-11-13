import { ArrowLeft, Search, Package, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const PartsDismantling = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const parts = [
    {
      id: 1,
      name: "Передний бампер",
      nameKk: "Алдыңғы бампер",
      car: "Toyota Camry 2015",
      price: "18,000 ₸",
      condition: "Хорошее",
      conditionKk: "Жақсы",
      location: "2.5 км",
      phone: "+7 (777) 123-45-67"
    },
    {
      id: 2,
      name: "Фара (правая)",
      nameKk: "Фара (оң жақ)",
      car: "Honda Accord 2018",
      price: "12,000 ₸",
      condition: "Отличное",
      conditionKk: "Тамаша",
      location: "3.2 км",
      phone: "+7 (777) 234-56-78"
    },
    {
      id: 3,
      name: "Двигатель 2.0L",
      nameKk: "Қозғалтқыш 2.0L",
      car: "Mazda 6 2016",
      price: "250,000 ₸",
      condition: "Хорошее",
      conditionKk: "Жақсы",
      location: "5.1 км",
      phone: "+7 (777) 345-67-89"
    },
    {
      id: 4,
      name: "Коробка передач",
      nameKk: "Беріліс қорабы",
      car: "Nissan Altima 2017",
      price: "180,000 ₸",
      condition: "Удовлетворительное",
      conditionKk: "Қанағаттанарлық",
      location: "4.3 км",
      phone: "+7 (777) 456-78-90"
    },
    {
      id: 5,
      name: "Капот",
      nameKk: "Капот",
      car: "Hyundai Elantra 2019",
      price: "25,000 ₸",
      condition: "Отличное",
      conditionKk: "Тамаша",
      location: "1.8 км",
      phone: "+7 (777) 567-89-01"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('partsDismantling')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchParts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {parts.map((part) => (
            <Card key={part.id} className="bg-card hover:bg-accent transition-all cursor-pointer hover:shadow-md">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-base">{part.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{part.car}</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{part.location}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('condition')}:</span>
                    <Badge variant="secondary">{part.condition}</Badge>
                  </div>
                  <span className="font-bold text-primary text-lg">{part.price}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Позвонить
                  </Button>
                  <Button size="sm" className="flex-1">
                    Подробнее
                  </Button>
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
