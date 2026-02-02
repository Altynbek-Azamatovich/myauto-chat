import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const NewsPage = () => {
  const navigate = useNavigate();

  const news = [
    {
      id: 1,
      title: "Новое приложение для автовладельцев",
      description: "Мы запустили мобильное приложение с расширенным функционалом",
      date: "2024-01-15",
      category: "Обновления"
    },
    {
      id: 2,
      title: "Скидки на ТО в январе",
      description: "Специальные предложения для владельцев всех марок автомобилей",
      date: "2024-01-10",
      category: "Акции"
    },
    {
      id: 3,
      title: "Открытие нового сервисного центра",
      description: "Теперь мы ближе к вам - новый центр в районе Алматы",
      date: "2024-01-05",
      category: "Новости"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Новости</h1>
      </header>

      <div className="p-4 space-y-4">
        <ServiceUnderDevelopment />

        <div className="space-y-3">
          {news.map((item) => (
            <div 
              key={item.id} 
              className="bg-muted/30 rounded-2xl overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <Badge className="absolute top-3 left-3 text-xs">{item.category}</Badge>
              </div>
              <div className="p-4 -mt-6 relative">
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
