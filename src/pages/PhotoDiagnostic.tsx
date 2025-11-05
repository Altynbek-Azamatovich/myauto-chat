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
      <header className="flex items-center justify-between px-4 pt-8 pb-4 flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <Menu className="h-6 w-6 text-white" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <User className="h-6 w-6 text-white" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 min-h-0">
        <div className="text-center mb-3 flex-shrink-0">
          <h1 className="text-lg font-bold mb-1">
            Сделай фото автомобиля
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            ИИ распознает повреждения
          </p>
          <p className="text-sm text-muted-foreground">
            и предложит решение
          </p>
        </div>

        {/* Camera Frame */}
        <div className="relative flex-1 mb-3 max-h-60">
          <div className="h-full bg-muted rounded-2xl overflow-hidden relative">
            {/* Placeholder for damaged car - will be replaced with camera feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted to-app-gray-light flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Камера будет здесь</p>
              </div>
            </div>
            
            {/* Camera corners */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-3 border-t-3 border-foreground"></div>
            <div className="absolute top-3 right-3 w-6 h-6 border-r-3 border-t-3 border-foreground"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-3 border-b-3 border-foreground"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-3 border-b-3 border-foreground"></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-8 pb-4 flex-shrink-0">
          <Button 
            className="w-full py-3 text-base font-semibold rounded-full bg-primary hover:bg-primary/90"
            onClick={handleCameraClick}
          >
            Запустить камеру
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoDiagnostic;