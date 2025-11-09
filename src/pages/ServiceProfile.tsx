import { ChevronLeft, ClipboardList, History, ShoppingBag, FileText, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceProfile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const menuItems = [
    {
      icon: Clock,
      title: t('language') === 'ru' ? 'Активные заявки' : 'Белсенді өтінімдер',
      description: t('language') === 'ru' ? 'Текущие заказы и их статус' : 'Ағымдағы тапсырыстар және олардың мәртебесі',
      count: 0,
      color: "text-orange-500"
    },
    {
      icon: CheckCircle2,
      title: t('language') === 'ru' ? 'Завершенные заявки' : 'Аяқталған өтінімдер',
      description: t('language') === 'ru' ? 'История выполненных заказов' : 'Орындалған тапсырыстар тарихы',
      count: 0,
      color: "text-green-500"
    },
    {
      icon: History,
      title: t('language') === 'ru' ? 'История заявок' : 'Өтінімдер тарихы',
      description: t('language') === 'ru' ? 'Все ваши заявки' : 'Барлық өтінімдеріңіз',
      color: "text-blue-500"
    },
    {
      icon: ShoppingBag,
      title: t('language') === 'ru' ? 'Покупки' : 'Сатып алулар',
      description: t('language') === 'ru' ? 'История покупок запчастей' : 'Бөлшектер сатып алу тарихы',
      color: "text-purple-500"
    },
    {
      icon: FileText,
      title: t('language') === 'ru' ? 'Документы' : 'Құжаттар',
      description: t('language') === 'ru' ? 'Чеки, гарантии, акты' : 'Түбіртектер, кепілдіктер, актілер',
      color: "text-indigo-500"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
          onClick={() => navigate("/services")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <h1 className="text-xl font-semibold">
          {t('language') === 'ru' ? 'Мой профиль' : 'Менің профилім'}
        </h1>

        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="px-4 pb-24 pt-4">
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="p-4 hover:bg-muted/50 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full bg-muted ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.count !== undefined && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Placeholder message */}
        <Card className="mt-6 p-6 text-center bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
          <ClipboardList className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t('language') === 'ru' 
              ? 'Здесь появятся ваши заявки и покупки' 
              : 'Мұнда сіздің өтінімдеріңіз бен сатып алуларыңыз пайда болады'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ServiceProfile;
