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

  // Auto-mark all as read when leaving the page
  useEffect(() => {
    return () => {
      if (unreadCount > 0) {
        markAllAsRead();
      }
    };
  }, [unreadCount, markAllAsRead]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>

        <Logo size="md" />

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{t('notifications')}</h1>
          {unreadCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {unreadCount} новых
            </span>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="bg-muted/30 rounded-2xl p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted/50 p-5">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{t('noNotifications')}</h3>
                <p className="text-sm text-muted-foreground">
                  У вас пока нет уведомлений
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <SwipeableItem 
                key={notification.id}
                onDelete={() => deleteNotification(notification.id)}
              >
                <div 
                  className={`p-4 cursor-pointer transition-colors rounded-2xl ${
                    notification.is_read ? 'bg-muted/30' : 'bg-primary/5'
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
                    {!notification.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
