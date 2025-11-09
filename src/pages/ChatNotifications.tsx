import { ChevronLeft, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ChatNotifications = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
          onClick={() => navigate("/super-chat")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <h1 className="text-xl font-semibold">{t('notifications')}</h1>

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 pb-24 pt-4">
        <Card className="p-8 text-center space-y-6 bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
          <div className="flex justify-center">
            <div className="relative">
              <Bell className="h-16 w-16 text-primary" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">
              {t('language') === 'ru' ? 'Уведомления' : 'Хабарландырулар'}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('language') === 'ru' 
                ? 'Здесь будут новости из чата и сообщества' 
                : 'Мұнда чат пен қауымдастықтан жаңалықтар болады'}
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div className="p-4 rounded-lg bg-background/50">
              <p className="font-medium text-sm text-muted-foreground">
                {t('language') === 'ru' 
                  ? '• Новые сообщения от сообщества' 
                  : '• Қауымдастықтан жаңа хабарламалар'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background/50">
              <p className="font-medium text-sm text-muted-foreground">
                {t('language') === 'ru' 
                  ? '• Важные обновления' 
                  : '• Маңызды жаңартулар'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background/50">
              <p className="font-medium text-sm text-muted-foreground">
                {t('language') === 'ru' 
                  ? '• Полезные советы и рекомендации' 
                  : '• Пайдалы кеңестер мен ұсыныстар'}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            {t('language') === 'ru' ? 'Скоро появится! 🚀' : 'Жақында пайда болады! 🚀'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ChatNotifications;
