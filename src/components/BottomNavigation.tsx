import { Home, Settings, Camera, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Главная", path: "/" },
    { icon: Settings, label: "Сервисы", path: "/services" },
    { icon: Camera, label: "Фото диагностика", path: "/photo-diagnostic" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isChatActive = location.pathname === "/super-chat";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center space-x-4">
        {/* Main navigation buttons */}
        <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-lg rounded-full p-3">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="lg"
              className={`rounded-full aspect-square p-2 ${
                isActive(item.path) 
                  ? "bg-foreground text-background shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-20 w-20" />
            </Button>
          ))}
        </div>

        {/* SuperChat FAB */}
        <div className="bg-black/40 backdrop-blur-lg border border-border rounded-full shadow-lg p-3">
          <Button
            size="lg"
            className={`rounded-full aspect-square p-2 ${
              isChatActive 
                ? "bg-app-green hover:bg-app-green/90 shadow-lg" 
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => navigate("/super-chat")}
          >
            <MessageCircle className={`h-20 w-20 ${
              isChatActive ? "text-white" : "text-muted-foreground"
            }`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;