import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <header className="flex items-center px-4 pt-6 pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('notificationSettings')}</h1>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t('allNotifications')}</h3>
              <p className="text-sm text-muted-foreground">{t('allNotificationsDesc')}</p>
            </div>
            <Switch 
              checked={notifications.all}
              onCheckedChange={() => handleToggle('all')}
            />
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground px-2">{t('notificationTypes')}</h3>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('maintenanceReminders')}</h4>
                <p className="text-sm text-muted-foreground">{t('maintenanceRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.maintenance}
                onCheckedChange={() => handleToggle('maintenance')}
                disabled={!notifications.all}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('insuranceReminders')}</h4>
                <p className="text-sm text-muted-foreground">{t('insuranceRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.insurance}
                onCheckedChange={() => handleToggle('insurance')}
                disabled={!notifications.all}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('oilChangeReminders')}</h4>
                <p className="text-sm text-muted-foreground">{t('oilChangeRemindersDesc')}</p>
              </div>
              <Switch 
                checked={notifications.oilChange}
                onCheckedChange={() => handleToggle('oilChange')}
                disabled={!notifications.all}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('newsUpdates')}</h4>
                <p className="text-sm text-muted-foreground">{t('newsUpdatesDesc')}</p>
              </div>
              <Switch 
                checked={notifications.news}
                onCheckedChange={() => handleToggle('news')}
                disabled={!notifications.all}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground px-2">{t('notificationBehavior')}</h3>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('sound')}</h4>
                <p className="text-sm text-muted-foreground">{t('soundDesc')}</p>
              </div>
              <Switch 
                checked={notifications.sound}
                onCheckedChange={() => handleToggle('sound')}
                disabled={!notifications.all}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{t('vibration')}</h4>
                <p className="text-sm text-muted-foreground">{t('vibrationDesc')}</p>
              </div>
              <Switch 
                checked={notifications.vibration}
                onCheckedChange={() => handleToggle('vibration')}
                disabled={!notifications.all}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
