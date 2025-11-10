import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@/assets/logo-new.png";

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold mb-6">{t('notifications')}</h1>
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
      </div>
    </div>
  );
};

export default Notifications;
