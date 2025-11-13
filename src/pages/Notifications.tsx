import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import logoImage from "@/assets/logo.svg";
import NotificationBadge from "@/components/NotificationBadge";

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

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
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-10 w-auto" />

        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('notifications')}</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Отметить все прочитанными
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted/30 p-6">
                <Bell className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('noNotifications')}</h3>
                <p className="text-sm text-muted-foreground">
                  У вас пока нет уведомлений
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors ${
                  notification.is_read ? 'bg-card' : 'bg-primary/5 border-primary/20'
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
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    Удалить
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
