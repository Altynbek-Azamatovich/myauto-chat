import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import tuning images
import bodyKitImage from "@/assets/tuning/body-kit.jpg";
import engineImage from "@/assets/tuning/engine.jpg";
import interiorImage from "@/assets/tuning/interior.jpg";
import lightsImage from "@/assets/tuning/lights.jpg";
import suspensionImage from "@/assets/tuning/suspension.jpg";

// Import car images for painting section
import redSedan from "@/assets/cars/sedan/red-sedan.png";
import graySedan from "@/assets/cars/sedan/gray-sedan.png";

interface TuningCategory {
  id: string;
  title: string;
  image: string;
  isFavorite?: boolean;
}

const favoriteCategories: TuningCategory[] = [
  { id: "body-kit", title: "Обвес", image: bodyKitImage, isFavorite: true },
  { id: "engine", title: "Тюнинг двигателя", image: engineImage, isFavorite: true },
  { id: "wheels", title: "Диски", image: lightsImage, isFavorite: true },
  { id: "painting", title: "Покраска", image: "", isFavorite: true },
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
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const displayCategories = activeTab === "favorites" ? favoriteCategories : allCategories;

  const handleTabChange = (tab: "favorites" | "all") => {
    setActiveTab(tab);
    setIsExpanded(tab === "all");
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/tuning/${categoryId}`);
  };

  return (
    <div className="px-4 pb-24 animate-fade-in">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-foreground">Тюнинг</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("favorites")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              activeTab === "favorites"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Избранное
          </button>
          <button
            onClick={() => handleTabChange("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              activeTab === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Все
          </button>
        </div>
      </div>

      {/* Categories Grid with overlapping effect */}
      <div 
        className={cn(
          "transition-all duration-500 ease-out",
          isExpanded ? "transform -translate-y-4" : ""
        )}
      >
        <div className="relative">
          {/* First row */}
          <div className="grid grid-cols-2 gap-3 mb-0">
            {displayCategories.slice(0, 2).map((category) => (
              <Card
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform bg-card border-0 shadow-lg"
                style={{ height: "140px" }}
              >
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm drop-shadow-lg">
                    {category.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>

          {/* Second row - overlapping */}
          <div className="grid grid-cols-2 gap-3 -mt-6 relative z-10">
            {displayCategories.slice(2, 4).map((category) => (
              <Card
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform bg-card border-0 shadow-xl"
                style={{ height: "140px" }}
              >
                <div className="absolute inset-0">
                  {category.id === "painting" ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <img
                        src={redSedan}
                        alt="Red car"
                        className="absolute w-[60%] object-contain -left-2 top-1/2 -translate-y-1/2"
                      />
                      <img
                        src={graySedan}
                        alt="Gray car"
                        className="absolute w-[60%] object-contain -right-2 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  ) : (
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white font-semibold text-sm drop-shadow-lg">
                    {category.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional rows when expanded */}
          {isExpanded && displayCategories.length > 4 && (
            <div className="grid grid-cols-2 gap-3 -mt-6 relative z-20 animate-fade-in">
              {displayCategories.slice(4, 6).map((category) => (
                <Card
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform bg-card border-0 shadow-xl"
                  style={{ height: "140px" }}
                >
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm drop-shadow-lg">
                      {category.title}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {isExpanded && displayCategories.length > 6 && (
            <div className="grid grid-cols-2 gap-3 -mt-6 relative z-30 animate-fade-in">
              {displayCategories.slice(6, 8).map((category) => (
                <Card
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform bg-card border-0 shadow-xl"
                  style={{ height: "140px" }}
                >
                  <div className="absolute inset-0">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm drop-shadow-lg">
                      {category.title}
                    </h3>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TuningSection;
