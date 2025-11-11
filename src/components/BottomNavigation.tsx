import { Home, Settings, Camera, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationBadge from "@/components/NotificationBadge";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { unreadByCategory } = useNotifications();
  
  const homeCount = unreadByCategory['home'] || 0;
  const servicesCount = unreadByCategory['services'] || 0;
  const chatCount = unreadByCategory['chat'] || 0;

  const navItems = [
    { icon: Home, label: t('home'), path: "/", count: homeCount },
    { icon: Settings, label: t('services'), path: "/services", count: servicesCount },
    { icon: Camera, label: t('photoDiagnostics'), path: "/photo-diagnostic", count: 0 },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isChatActive = location.pathname === "/super-chat";

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
      <div className="flex items-center space-x-4">
        {/* Main navigation buttons */}
        <div className="flex items-center bg-black/20 backdrop-blur-lg rounded-full p-3 min-w-[220px]">
          <div className="flex items-center justify-between w-full relative">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const firstActive = isActive(navItems[0].path);
              const lastActive = isActive(navItems[2].path);
              
              let marginClass = '';
              if (index === 0) {
                marginClass = lastActive ? 'mr-auto' : '';
              } else if (index === 1) {
                marginClass = firstActive ? 'ml-auto' : lastActive ? 'mr-auto' : 'mx-auto';
              } else if (index === 2) {
                marginClass = firstActive ? 'ml-auto' : '';
              }
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="lg"
                  className={`rounded-full aspect-square p-2 relative transition-all duration-300 ${
                    active 
                      ? "bg-white/40 text-white hover:bg-white/50 ring-2 ring-white/60" 
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  } ${marginClass}`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={24} strokeWidth={1.5} />
                  <NotificationBadge count={item.count} size="sm" className="absolute -top-1 -right-1" />
                </Button>
              );
            })}
          </div>
        </div>

        {/* SuperChat FAB */}
        <div className={`bg-black/20 backdrop-blur-lg rounded-full shadow-lg p-3 border-2 transition-colors ${
          isChatActive 
            ? "border-app-green" 
            : "border-transparent"
        }`}>
          <Button
            size="lg"
            className="rounded-full aspect-square p-2 bg-transparent hover:bg-transparent relative"
            onClick={() => navigate("/super-chat")}
          >
            <MessageCircle size={24} strokeWidth={1.5} className="text-white" />
            <NotificationBadge count={chatCount} size="sm" className="absolute -top-1 -right-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
