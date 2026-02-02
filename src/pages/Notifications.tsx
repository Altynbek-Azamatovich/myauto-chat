import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Logo from "@/components/Logo";
import { SwipeableItem } from "@/components/SwipeableItem";

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  // Mark all as read when leaving the page
  useEffect(() => {
    return () => {
      if (unreadCount > 0) {
        markAllAsRead();
      }
    };
  }, [unreadCount, markAllAsRead]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <Logo size="md" />

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 py-4 pb-24">
        <h1 className="text-xl font-bold mb-4">{t('notifications')}</h1>
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Bell className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium mb-1">{t('noNotifications')}</h3>
            <p className="text-sm text-muted-foreground">
              У вас пока нет уведомлений
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <SwipeableItem
                key={notification.id}
                onDelete={() => deleteNotification(notification.id)}
              >
                <div 
                  className={`p-4 bg-muted/20 rounded-2xl cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    if (notification.action_url) {
                      navigate(notification.action_url);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.is_read ? 'bg-transparent' : 'bg-primary'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight">{notification.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </SwipeableItem>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;