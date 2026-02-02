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
        <div className="relative w-full max-w-sm h-40 mb-8 overflow-hidden flex flex-col justify-center gap-2">
          {/* Barrier animation - enters from right, aligns to left */}
          <div className="overflow-hidden w-full">
            <img
              src={constructionBarrier}
              alt="Under Construction"
              className="h-16 object-contain animate-barrier-ping-pong"
            />
          </div>
          {/* Car animation - enters from right, aligns to left */}
          <div className="overflow-hidden w-full">
            <img
              src={carImage}
              alt="Car"
              className="h-20 object-contain animate-car-ping-pong"
            />
          </div>
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

      {/* Custom animation styles - ping pong like AutoForum */}
      <style>{`
        @keyframes ping-pong-car {
          0%, 100% { transform: translateX(calc(100vw - 100%)); }
          50% { transform: translateX(0); }
        }
        @keyframes ping-pong-barrier {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(calc(100vw - 100%)); }
        }
        
        .animate-car-ping-pong {
          animation: ping-pong-car 8s ease-in-out infinite;
        }
        
        .animate-barrier-ping-pong {
          animation: ping-pong-barrier 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TuningCategory;
