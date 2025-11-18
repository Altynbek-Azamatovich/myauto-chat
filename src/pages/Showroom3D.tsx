import { useState } from "react";
import { ArrowLeft, RotateCw, ZoomIn, ZoomOut, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const Showroom3D = () => {
  const navigate = useNavigate();
  const [selectedCar, setSelectedCar] = useState(0);
  const [rotation, setRotation] = useState([0]);
  const [color, setColor] = useState("blue");

  const cars = [
    {
      id: 1,
      name: "Toyota Camry 2024",
      price: 15000000,
      colors: ["blue", "red", "black", "white"]
    },
    {
      id: 2,
      name: "Mercedes-Benz E-Class",
      price: 25000000,
      colors: ["black", "silver", "white"]
    },
    {
      id: 3,
      name: "BMW X5",
      price: 30000000,
      colors: ["blue", "black", "white", "gray"]
    }
  ];

  const colorMap: Record<string, string> = {
    blue: "#3B82F6",
    red: "#EF4444",
    black: "#1F2937",
    white: "#F3F4F6",
    silver: "#9CA3AF",
    gray: "#6B7280"
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">3D Шоурум</h1>
          <p className="text-sm text-muted-foreground">Виртуальный просмотр автомобилей</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-80 bg-gradient-to-br from-muted via-background to-muted relative flex items-center justify-center">
              <div
                className="w-64 h-32 rounded-3xl shadow-2xl transition-all duration-300"
                style={{
                  backgroundColor: colorMap[color],
                  transform: `perspective(1000px) rotateY(${rotation[0]}deg) rotateX(10deg)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                <div className="absolute bottom-4 left-4 right-4 h-8 bg-black/50 rounded-lg backdrop-blur-sm" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 border-4 border-black/20 rounded-full" />
                  <div className="absolute top-1/2 left-full w-8 h-0.5 bg-black/20" />
                  <div className="absolute top-1/2 right-full w-8 h-0.5 bg-black/20" />
                </div>
              </div>
              
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button variant="secondary" size="icon" className="rounded-full">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Поворот
                  </span>
                  <span className="text-xs text-muted-foreground">{rotation[0]}°</span>
                </div>
                <Slider
                  value={rotation}
                  onValueChange={setRotation}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium">Цвет</span>
                </div>
                <div className="flex gap-2">
                  {cars[selectedCar].colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-10 h-10 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: colorMap[c],
                        borderColor: color === c ? "hsl(var(--primary))" : "transparent",
                        transform: color === c ? "scale(1.1)" : "scale(1)"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-lg mb-2">{cars[selectedCar].name}</h2>
            <p className="text-2xl font-bold text-primary mb-4">
              {cars[selectedCar].price.toLocaleString()} ₸
            </p>
            <Button className="w-full">Записаться на тест-драйв</Button>
          </CardContent>
        </Card>

        <div>
          <h3 className="font-semibold mb-3">Другие модели</h3>
          <div className="space-y-2">
            {cars.map((car, index) => (
              <Card
                key={car.id}
                className={`cursor-pointer transition-all ${
                  selectedCar === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCar(index)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{car.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      от {car.price.toLocaleString()} ₸
                    </p>
                  </div>
                  {selectedCar === index && (
                    <Badge variant="default">Выбрано</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showroom3D;
