import { Menu, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";

const PhotoDiagnostic = () => {
  const handleCameraClick = () => {
    // Placeholder for camera functionality
    console.log("Camera clicked - will be implemented with real camera access");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <Menu className="h-6 w-6 text-white" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <User className="h-6 w-6 text-white" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold">
            Фото-диагностика
          </h1>
          
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Мы работаем над созданием фото-диагностики:
            </p>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🤖 ИИ распознает повреждения автомобиля</p>
              <p>📸 Мгновенный анализ по фото</p>
              <p>💡 Умные рекомендации по ремонту</p>
              <p>💰 Оценка стоимости работ</p>
            </div>
          </div>
          
          <div className="pt-4">
            <p className="text-sm font-medium text-primary">
              Скоро будет доступно! 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDiagnostic;