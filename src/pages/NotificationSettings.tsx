import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : {
      all: true,
      maintenance: true,
      insurance: true,
      oilChange: true,
      news: true,
      sound: true,
      vibration: true
    };
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleToggle = (key: string) => {
    setNotifications((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{t('notificationSettings')}</h1>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
          <div>
            <h3 className="font-medium">{t('allNotifications')}</h3>
            <p className="text-sm text-muted-foreground">{t('allNotificationsDesc')}</p>
          </div>
          <Switch 
            checked={notifications.all}
            onCheckedChange={() => handleToggle('all')}
          />
        </div>

        {/* Notification Types */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1 mb-3">{t('notificationTypes')}</h3>
          
          <div className="bg-muted/20 rounded-2xl overflow-hidden divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('maintenanceReminders')}</h4>
                <p className="text-xs text-muted-foreground">{t('maintenanceRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.maintenance}
                onCheckedChange={() => handleToggle('maintenance')}
                disabled={!notifications.all}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('insuranceReminders')}</h4>
                <p className="text-xs text-muted-foreground">{t('insuranceRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.insurance}
                onCheckedChange={() => handleToggle('insurance')}
                disabled={!notifications.all}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('oilChangeReminders')}</h4>
                <p className="text-xs text-muted-foreground">{t('oilChangeRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.oilChange}
                onCheckedChange={() => handleToggle('oilChange')}
                disabled={!notifications.all}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('newsUpdates')}</h4>
                <p className="text-xs text-muted-foreground">{t('newsUpdatesDesc')}</p>
              </div>
              <Switch 
                checked={notifications.news}
                onCheckedChange={() => handleToggle('news')}
                disabled={!notifications.all}
              />
            </div>
          </div>
        </div>

        {/* Behavior Settings */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1 mb-3">{t('notificationBehavior')}</h3>
          
          <div className="bg-muted/20 rounded-2xl overflow-hidden divide-y divide-border/50">
            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('sound')}</h4>
                <p className="text-xs text-muted-foreground">{t('soundDesc')}</p>
              </div>
              <Switch 
                checked={notifications.sound}
                onCheckedChange={() => handleToggle('sound')}
                disabled={!notifications.all}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-medium text-sm">{t('vibration')}</h4>
                <p className="text-xs text-muted-foreground">{t('vibrationDesc')}</p>
              </div>
              <Switch 
                checked={notifications.vibration}
                onCheckedChange={() => handleToggle('vibration')}
                disabled={!notifications.all}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;