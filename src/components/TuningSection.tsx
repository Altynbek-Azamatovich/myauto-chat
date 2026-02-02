import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import tuning images
import bodyKitImage from "@/assets/tuning/body-kit.jpg";
import engineImage from "@/assets/tuning/engine.jpg";
import interiorImage from "@/assets/tuning/interior.jpg";
import suspensionImage from "@/assets/tuning/suspension.jpg";
import lightsImage from "@/assets/tuning/lights.jpg";
import wheelImage from "@/assets/tuning/wheel.png";

// Import car images for painting section
import redSedan from "@/assets/cars/sedan/red-sedan.png";

interface TuningCategory {
  id: string;
  title: string;
  image: string;
  isPainting?: boolean;
}

const favoriteCategories: TuningCategory[] = [
  { id: "body-kit", title: "Обвес", image: bodyKitImage },
  { id: "engine", title: "Тюнинг двигателя", image: engineImage },
  { id: "wheels", title: "Диски", image: wheelImage },
  { id: "painting", title: "Покраска", image: "", isPainting: true },
];

const allCategories: TuningCategory[] = [
  ...favoriteCategories,
  { id: "interior", title: "Интерьер", image: interiorImage },
  { id: "suspension", title: "Подвеска", image: suspensionImage },
  { id: "lighting", title: "Оптика", image: lightsImage },
  { id: "audio", title: "Аудиосистема", image: interiorImage },
];

interface TuningSectionProps {
  onClose: () => void;
}

const TuningSection = ({ onClose }: TuningSectionProps) => {
  const [activeTab, setActiveTab] = useState<"favorites" | "all">("favorites");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const displayCategories = activeTab === "favorites" ? favoriteCategories : allCategories;
  const isExpanded = activeTab === "all";

  const handleCategoryClick = (categoryId: string) => {
    sessionStorage.setItem('tuningActiveTab', activeTab);
    navigate(`/tuning/${categoryId}`);
  };

  const handleBackFromExpanded = () => {
    setActiveTab("favorites");
  };

  // Shared card styles
  const cardBaseStyles = "relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform";
  const cardInnerShadow = "shadow-[inset_0_2px_15px_rgba(0,0,0,0.3),inset_0_-2px_15px_rgba(0,0,0,0.2)]";

  // Render category card content
  const renderCardContent = (category: TuningCategory) => (
    <>
      <div className="absolute inset-0">
        {category.isPainting ? (
          <div className="w-full h-full flex items-center justify-end bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 overflow-hidden">
            <img
              src={redSedan}
              alt="Red car"
              className="h-[85%] w-auto object-contain mr-2"
            />
          </div>
        ) : (
          <img
            src={category.image}
            alt={category.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {/* Inner shadow overlay */}
      <div className={cn("absolute inset-0 pointer-events-none", cardInnerShadow)} />
      {/* Text with background shadow */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent">
        <h3 className="text-white font-semibold text-sm">
          {category.title}
        </h3>
      </div>
    </>
  );

  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-out",
        isExpanded 
          ? "fixed inset-0 z-[100] bg-background pt-4 pb-24 overflow-y-auto"
          : "px-4 pb-24",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between mb-4", isExpanded && "px-4")}>
        {isExpanded ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackFromExpanded}
              className="rounded-full hover:bg-muted/30"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-2xl font-bold text-foreground">Тюнинг</h2>
            <div className="w-10" />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground">Тюнинг</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("favorites")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  !isExpanded
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Избранное
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  isExpanded
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Все
              </button>
            </div>
          </>
        )}
      </div>

      {/* Categories Grid */}
      {isExpanded ? (
        <div className="grid grid-cols-2 gap-3 px-4 animate-fade-in">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cardBaseStyles}
              style={{ height: "120px", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
            >
              {renderCardContent(category)}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* First row */}
          <div className="grid grid-cols-2 gap-3 mb-0">
            {displayCategories.slice(0, 2).map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(cardBaseStyles, "shadow-lg")}
                style={{ height: "140px" }}
              >
                {renderCardContent(category)}
              </div>
            ))}
          </div>

          {/* Second row - overlapping */}
          <div className="grid grid-cols-2 gap-3 -mt-10 relative z-10">
            {displayCategories.slice(2, 4).map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(cardBaseStyles, "shadow-[0_-8px_25px_rgba(0,0,0,0.4)]")}
                style={{ height: "140px" }}
              >
                {renderCardContent(category)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TuningSection;
