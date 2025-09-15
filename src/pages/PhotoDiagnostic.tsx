import { Menu, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo.png";

const PhotoDiagnostic = () => {
  const handleCameraClick = () => {
    // Placeholder for camera functionality
    console.log("Camera clicked - will be implemented with real camera access");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <Menu className="h-6 w-6" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-8 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <User className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">
            Сделай фото автомобиля
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            ИИ распознает повреждения
          </p>
          <p className="text-lg text-muted-foreground">
            и предложит решение
          </p>
        </div>

        {/* Camera Frame */}
        <div className="relative mb-8">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative">
            {/* Placeholder for damaged car - will be replaced with camera feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted to-app-gray-light flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Camera className="h-16 w-16 mx-auto mb-4" />
                <p className="text-sm">Камера будет здесь</p>
              </div>
            </div>
            
            {/* Camera corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-foreground"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-foreground"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-foreground"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-foreground"></div>
          </div>
        </div>

        {/* Camera Button */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 shadow-lg">
            <Camera className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        {/* Action Button */}
        <div className="px-8 pb-20">
          <Button 
            className="w-full py-4 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90"
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