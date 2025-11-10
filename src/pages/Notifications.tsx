import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { AppSidebar } from "@/components/AppSidebar";
import logoImage from "@/assets/logo-new.png";

const Notifications = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <AppSidebar 
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          }
        />

        <img src={logoImage} alt="myAuto" className="h-10 w-auto" />

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground bg-primary/10">
          <Bell className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      <div className="px-4 pb-24">
        <h1 className="text-2xl font-bold mb-4">{t('notifications')}</h1>
        <Card className="p-6 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('noNotifications')}</p>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
