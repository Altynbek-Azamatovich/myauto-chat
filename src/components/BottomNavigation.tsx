import { Home, Settings, Camera, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('home'), path: "/" },
    { icon: Settings, label: t('services'), path: "/services" },
    { icon: Camera, label: t('photoDiagnostics'), path: "/photo-diagnostic" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isChatActive = location.pathname === "/super-chat";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 animate-fade-in">
      <div className="flex items-center space-x-4">
        {/* Main navigation buttons */}
        <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-xl rounded-full p-3 shadow-2xl border border-white/10">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="lg"
              className={`rounded-full aspect-square p-2 transition-all duration-300 ease-out ${
                isActive(item.path) 
                  ? "bg-white/50 text-white hover:bg-white/60 scale-110 shadow-lg" 
                  : "text-white/70 hover:bg-white/20 hover:text-white hover:scale-105"
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={64} strokeWidth={1.5} />
            </Button>
          ))}
        </div>

        {/* SuperChat FAB */}
        <div className={`bg-black/30 backdrop-blur-xl rounded-full shadow-2xl p-3 border-2 transition-all duration-300 ${
          isChatActive 
            ? "border-app-green scale-110 shadow-app-green/50" 
            : "border-white/10 hover:scale-105 hover:border-white/20"
        }`}>
          <Button
            size="lg"
            className="rounded-full aspect-square p-2 bg-transparent hover:bg-white/10 transition-all duration-300"
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