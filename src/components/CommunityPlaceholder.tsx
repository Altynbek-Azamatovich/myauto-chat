import { Users, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export const CommunityPlaceholder = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
        <div className="flex justify-center">
          <div className="relative">
            <Users className="h-16 w-16 text-primary" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold">
            Сообщество скоро!
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Мы работаем над созданием сообщества, где вы сможете:
          </p>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
            <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Групповые чаты</p>
              <p className="text-sm text-muted-foreground">
                Общайтесь с другими автовладельцами
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
            <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Тематические группы</p>
              <p className="text-sm text-muted-foreground">
                Присоединяйтесь к группам по интересам
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Обмен опытом</p>
              <p className="text-sm text-muted-foreground">
                Делитесь советами и получайте помощь
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground italic">
          Следите за обновлениями! 🚀
        </p>
      </Card>
    </div>
  );
};
