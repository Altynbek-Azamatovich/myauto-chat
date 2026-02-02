import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import animation assets
import carImage from "@/assets/cars/sedan/red-sedan.png";
import constructionBarrier from "@/assets/construction-barrier.png";

const categoryTitles: Record<string, string> = {
  "body-kit": "Обвес",
  "engine": "Тюнинг двигателя",
  "wheels": "Диски",
  "painting": "Покраска",
  "interior": "Интерьер",
  "suspension": "Подвеска",
  "lighting": "Оптика",
  "audio": "Аудиосистема",
};

const TuningCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const title = categoryId ? categoryTitles[categoryId] || "Тюнинг" : "Тюнинг";

  const handleBack = () => {
    // Return to Home with tuning mode active
    navigate('/', { state: { tuningMode: true } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with back button */}
      <header className="flex items-center px-4 py-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-10">
          {title}
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Animation container */}
        <div className="relative w-full max-w-sm h-64 mb-8">
          {/* Car animation */}
          <img
            src={carImage}
            alt="Car"
            className="absolute left-0 h-32 object-contain animate-car-slide"
          />
          {/* Barrier animation */}
          <img
            src={constructionBarrier}
            alt="Under Construction"
            className="absolute right-0 h-24 object-contain animate-barrier-slide"
          />
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">
            Раздел находится в разработке
          </p>
        </div>

        {/* Support button */}
        <Button
          onClick={() => window.open("https://pay.kaspi.kz/pay/devnqngt", "_blank")}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold px-8 py-6 rounded-2xl flex items-center gap-2"
        >
          <Heart className="h-5 w-5" />
          Поддержать проект
        </Button>
      </div>

      {/* Custom animation styles */}
      <style>{`
        @keyframes carSlide {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            transform: translateX(20%);
            opacity: 1;
          }
          50% {
            transform: translateX(20%);
            opacity: 1;
          }
          80% {
            transform: translateX(20%);
            opacity: 1;
          }
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes barrierSlide {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          20% {
            transform: translateX(-20%);
            opacity: 1;
          }
          50% {
            transform: translateX(-20%);
            opacity: 1;
          }
          80% {
            transform: translateX(-20%);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-car-slide {
          animation: carSlide 5s ease-in-out infinite;
        }
        
        .animate-barrier-slide {
          animation: barrierSlide 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TuningCategory;
