import { useState } from "react";
import { ArrowLeft, Search, Filter, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const PartsCatalog = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"new" | "used">("new");

  const parts = [
    {
      id: 1,
      name: "Тормозные колодки Brembo",
      brand: "Brembo",
      price: 15000,
      condition: "new",
      inStock: true
    },
    {
      id: 2,
      name: "Масляный фильтр Mann",
      brand: "Mann",
      price: 2500,
      condition: "new",
      inStock: true
    },
    {
      id: 3,
      name: "Двигатель Toyota 2.0",
      brand: "Toyota",
      price: 250000,
      condition: "used",
      inStock: true
    },
    {
      id: 4,
      name: "Коробка передач Mercedes",
      brand: "Mercedes",
      price: 180000,
      condition: "used",
      inStock: false
    }
  ];

  const filteredParts = parts.filter(
    (part) => part.condition === selectedType &&
    part.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Каталог запчастей</h1>
          <p className="text-xs text-muted-foreground">Новые и б/у запчасти</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <ServiceUnderDevelopment />

        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as "new" | "used")}>
          <TabsList className="grid w-full grid-cols-2 h-10 rounded-xl">
            <TabsTrigger value="new" className="rounded-lg text-sm">Новые</TabsTrigger>
            <TabsTrigger value="used" className="rounded-lg text-sm">Б/У</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск запчастей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-muted/50 rounded-xl h-11"
            />
          </div>
          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-muted/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {filteredParts.map((part) => (
            <div 
              key={part.id} 
              className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-0.5 truncate">{part.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{part.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-primary">
                      {part.price.toLocaleString()} ₸
                    </span>
                    <Badge variant={part.inStock ? "default" : "secondary"} className="text-xs">
                      {part.inStock ? "В наличии" : "Под заказ"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartsCatalog;
