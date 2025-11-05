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
        <div className="flex items-center space-x-3 bg-black/20 backdrop-blur-lg rounded-full p-3">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="lg"
              className={`rounded-full aspect-square p-2 ${
                isActive(item.path) 
                  ? "bg-white/40 text-white hover:bg-white/50" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={64} strokeWidth={1.5} />
            </Button>
          ))}
        </div>

        {/* SuperChat FAB */}
        <div className={`bg-black/20 backdrop-blur-lg rounded-full shadow-lg p-3 border-2 ${
          isChatActive 
            ? "border-app-green" 
            : "border-transparent"
        }`}>
          <Button
            size="lg"
            className="rounded-full aspect-square p-2 bg-transparent hover:bg-transparent"
            onClick={() => navigate("/super-chat")}
          >
            <MessageCircle size={64} strokeWidth={1.5} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;