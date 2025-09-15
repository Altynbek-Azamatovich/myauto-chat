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
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Main navigation buttons */}
        <div className="flex items-center space-x-2 bg-muted/50 rounded-full p-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                isActive(item.path) 
                  ? "bg-foreground text-background shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>

        {/* SuperChat FAB */}
        <Button
          size="lg"
          className={`rounded-full aspect-square p-3 ${
            isChatActive 
              ? "bg-app-green hover:bg-app-green/90 shadow-lg" 
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => navigate("/super-chat")}
        >
          <MessageCircle className={`h-6 w-6 ${
            isChatActive ? "text-white" : "text-muted-foreground"
          }`} />
        </Button>
      </div>
    </div>
  );
};

export default BottomNavigation;