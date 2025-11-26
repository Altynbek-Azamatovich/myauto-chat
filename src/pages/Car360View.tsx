import { useState } from "react";
import { ArrowLeft, RotateCw, Palette, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import carImage from "@/assets/car-3d-wireframe.png";

const Car360View = () => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState([0]);
  const [selectedColor, setSelectedColor] = useState("wireframe");

  const colors = [
    { id: "wireframe", name: "Каркас", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "red", name: "Красный", color: "#EF4444" },
    { id: "blue", name: "Синий", color: "#3B82F6" },
    { id: "black", name: "Черный", color: "#1F2937" },
    { id: "white", name: "Белый", color: "#F3F4F6" },
    { id: "silver", name: "Серебристый", color: "#9CA3AF" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-card sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">360° Просмотр</h1>
          <p className="text-sm text-muted-foreground">Интерактивный обзор автомобиля</p>
        </div>
      </header>

      {/* Info Alert */}
      <div className="p-4">
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>В разработке</AlertTitle>
          <AlertDescription>
            Функция 360° просмотра находится в стадии разработки. Скоро здесь будет полноценная интерактивная модель.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Car Display */}
        <Card className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div 
            className="relative z-10 transition-transform duration-300"
            style={{ 
              transform: `perspective(1200px) rotateY(${rotation[0]}deg)`,
            }}
          >
            <img 
              src={carImage} 
              alt="Car 360 View" 
              className="w-full max-w-2xl h-auto drop-shadow-2xl"
              style={{
                filter: selectedColor !== "wireframe" ? `hue-rotate(${colors.findIndex(c => c.id === selectedColor) * 60}deg)` : "none"
              }}
            />
          </div>
          
          {/* Rotation Badge */}
          <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm">
            {rotation[0]}°
          </Badge>
        </Card>

        {/* Controls Section */}
        <div className="space-y-4">
          {/* Rotation Control */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-primary" />
                Поворот модели
              </span>
              <span className="text-xs text-muted-foreground font-mono">{rotation[0]}°</span>
            </div>
            <Slider
              value={rotation}
              onValueChange={setRotation}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </Card>

          {/* Color Constructor */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Конструктор цвета</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedColor === color.id 
                      ? "border-primary bg-primary/5 scale-105" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full border-2 border-border"
                    style={{ background: color.color }}
                  />
                  <span className="text-xs font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full">
              Сбросить
            </Button>
            <Button className="w-full">
              Сохранить конфигурацию
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Car360View;
