import { useState } from "react";
import { ArrowLeft, Box, Palette, Wrench, Info, Maximize, Move } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import carImage from "@/assets/car-3d-wireframe.png";

const Car3DModel = () => {
  const navigate = useNavigate();
  const [rotationX, setRotationX] = useState([15]);
  const [rotationY, setRotationY] = useState([25]);
  const [zoom, setZoom] = useState([100]);
  const [selectedColor, setSelectedColor] = useState("wireframe");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const colors = [
    { id: "wireframe", name: "Каркас", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "red", name: "Красный", color: "#EF4444" },
    { id: "blue", name: "Синий", color: "#3B82F6" },
    { id: "black", name: "Черный", color: "#1F2937" },
    { id: "white", name: "Белый", color: "#F3F4F6" },
    { id: "silver", name: "Серебро", color: "#9CA3AF" },
  ];

  const parts = [
    { id: "body", name: "Кузов", icon: Box },
    { id: "wheels", name: "Диски", icon: Box },
    { id: "interior", name: "Салон", icon: Box },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-card sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">3D Модель</h1>
          <p className="text-sm text-muted-foreground">Детальная настройка автомобиля</p>
        </div>
      </header>

      {/* Info Alert */}
      <div className="p-4">
        <Alert className="border-primary/50 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>В разработке</AlertTitle>
          <AlertDescription>
            3D конфигуратор находится в стадии разработки. В финальной версии будет доступна полная настройка всех элементов.
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* 3D Display */}
        <Card className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/50 via-background to-muted/30 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
          
          {/* Control hints */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Move className="h-3 w-3" />
              Поворот
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Maximize className="h-3 w-3" />
              Масштаб: {zoom[0]}%
            </Badge>
          </div>

          {selectedPart && (
            <Badge className="absolute top-4 right-4 bg-primary">
              Выбрано: {parts.find(p => p.id === selectedPart)?.name}
            </Badge>
          )}

          <div 
            className="relative z-10 transition-all duration-500"
            style={{ 
              transform: `perspective(1500px) rotateX(${rotationX[0]}deg) rotateY(${rotationY[0]}deg) scale(${zoom[0] / 100})`,
            }}
          >
            <img 
              src={carImage} 
              alt="Car 3D Model" 
              className="w-full max-w-3xl h-auto drop-shadow-2xl"
              style={{
                filter: selectedColor !== "wireframe" ? `hue-rotate(${colors.findIndex(c => c.id === selectedColor) * 60}deg)` : "none"
              }}
            />
          </div>
        </Card>

        {/* Constructor Controls */}
        <Tabs defaultValue="rotation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rotation">Поворот</TabsTrigger>
            <TabsTrigger value="color">Цвет</TabsTrigger>
            <TabsTrigger value="parts">Детали</TabsTrigger>
          </TabsList>

          <TabsContent value="rotation" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Горизонтальный</span>
                    <span className="text-xs text-muted-foreground">{rotationY[0]}°</span>
                  </div>
                  <Slider
                    value={rotationY}
                    onValueChange={setRotationY}
                    min={-180}
                    max={180}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Вертикальный</span>
                    <span className="text-xs text-muted-foreground">{rotationX[0]}°</span>
                  </div>
                  <Slider
                    value={rotationX}
                    onValueChange={setRotationX}
                    min={-90}
                    max={90}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Масштаб</span>
                    <span className="text-xs text-muted-foreground">{zoom[0]}%</span>
                  </div>
                  <Slider
                    value={zoom}
                    onValueChange={setZoom}
                    min={50}
                    max={200}
                    step={10}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="color" className="mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Выбор цвета</span>
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
          </TabsContent>

          <TabsContent value="parts" className="mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Настройка деталей</span>
              </div>
              <div className="space-y-2">
                {parts.map((part) => {
                  const Icon = part.icon;
                  return (
                    <button
                      key={part.id}
                      onClick={() => setSelectedPart(part.id === selectedPart ? null : part.id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedPart === part.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{part.name}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              setRotationX([15]);
              setRotationY([25]);
              setZoom([100]);
              setSelectedColor("wireframe");
              setSelectedPart(null);
            }}
          >
            Сбросить
          </Button>
          <Button>
            Сохранить настройки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Car3DModel;
