import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const title = categoryId ? categoryTitles[categoryId] || "Тюнинг" : "Тюнинг";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with back button */}
      <header className="flex items-center px-4 py-4 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-10">
          {title}
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Animation container */}
        <div className="relative w-full h-48 mb-8 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={carImage}
              alt="Car"
              className="h-32 object-contain animate-[slide-in-right_2s_ease-out_infinite]"
              style={{
                animation: "carSlide 4s ease-in-out infinite",
              }}
            />
            <img
              src={constructionBarrier}
              alt="Under Construction"
              className="absolute h-20 object-contain"
              style={{
                animation: "barrierSlide 4s ease-in-out infinite",
              }}
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

      {/* Custom animation styles */}
      <style>{`
        @keyframes carSlide {
          0%, 100% {
            transform: translateX(100%);
            opacity: 0;
          }
          20% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(0);
            opacity: 1;
          }
          70% {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes barrierSlide {
          0%, 100% {
            transform: translateX(-100%);
            opacity: 0;
          }
          20% {
            transform: translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateX(0);
            opacity: 1;
          }
          70% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TuningCategory;
