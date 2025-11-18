import { ArrowLeft, Calendar, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NewsPage = () => {
  const navigate = useNavigate();

  const news = [
    {
      id: 1,
      title: "Новое приложение для автовладельцев",
      description: "Мы запустили мобильное приложение с расширенным функционалом",
      date: "2024-01-15",
      category: "Обновления",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Скидки на ТО в январе",
      description: "Специальные предложения для владельцев всех марок автомобилей",
      date: "2024-01-10",
      category: "Акции",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Открытие нового сервисного центра",
      description: "Теперь мы ближе к вам - новый центр в районе Алматы",
      date: "2024-01-05",
      category: "Новости",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Новости</h1>
      </header>

      <div className="p-4">
        <div className="mb-6 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Будьте в курсе</h2>
            <p className="text-muted-foreground mb-4">
              Последние новости автомира и обновления сервисов
            </p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-20">
            <Smartphone className="h-16 w-16 rotate-12" />
            <Smartphone className="h-16 w-16 -rotate-12" />
          </div>
        </div>

        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 bg-muted relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3">{item.category}</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
