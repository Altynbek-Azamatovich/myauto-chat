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
    // Trigger slide-up animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const displayCategories = activeTab === "favorites" ? favoriteCategories : allCategories;
  const isExpanded = activeTab === "all";

  const handleCategoryClick = (categoryId: string) => {
    // Store current tab in sessionStorage so we can return to it
    sessionStorage.setItem('tuningActiveTab', activeTab);
    navigate(`/tuning/${categoryId}`);
  };

  const handleBackFromExpanded = () => {
    setActiveTab("favorites");
  };

  // Render a single category card
  const renderCategoryCard = (category: TuningCategory, isBottomRow: boolean = false) => (
    <div
      key={category.id}
      onClick={() => handleCategoryClick(category.id)}
      className={cn(
        "relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform bg-muted",
        isBottomRow && "shadow-[0_-8px_20px_rgba(0,0,0,0.3)]"
      )}
      style={{ 
        height: isExpanded ? "120px" : "140px",
        boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.25)" : undefined
      }}
    >
      <div className="absolute inset-0">
        {category.isPainting ? (
          <div className="w-full h-full flex items-center justify-end bg-muted">
            <img
              src={redSedan}
              alt="Red car"
              className="h-full w-auto object-contain scale-[2] origin-right"
              style={{ marginRight: 0 }}
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
      <div className="absolute top-3 left-3 right-3">
        <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {category.title}
        </h3>
      </div>
    </div>
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
      {/* Header with tabs or back button */}
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
            <div className="w-10" /> {/* Spacer for alignment */}
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
        // Full page grid for "All" tab
        <div className="grid grid-cols-2 gap-3 px-4 animate-fade-in">
          {displayCategories.map((category) => renderCategoryCard(category, false))}
        </div>
      ) : (
        // Overlapping layout for "Favorites" tab
        <div className="relative">
          {/* First row */}
          <div className="grid grid-cols-2 gap-3 mb-0">
            {displayCategories.slice(0, 2).map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform bg-muted shadow-lg"
                style={{ height: "140px" }}
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {category.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Second row - overlapping more */}
          <div className="grid grid-cols-2 gap-3 -mt-10 relative z-10">
            {displayCategories.slice(2, 4).map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform bg-muted shadow-[0_-8px_20px_rgba(0,0,0,0.3)]"
                style={{ height: "140px" }}
              >
                <div className="absolute inset-0">
                  {category.isPainting ? (
                    <div className="w-full h-full flex items-center justify-end bg-muted overflow-hidden">
                      <img
                        src={redSedan}
                        alt="Red car"
                        className="h-full w-auto object-contain scale-[2] origin-right"
                        style={{ marginRight: 0 }}
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
                <div className="absolute top-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {category.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TuningSection;
