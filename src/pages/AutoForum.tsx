import { useState } from "react";
import { ArrowLeft, MessageCircle, ThumbsUp, TrendingUp, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoForum = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const posts = [
    {
      id: 1,
      title: "Лучшее масло для Toyota Camry",
      titleKk: "Toyota Camry үшін ең жақсы май",
      author: "AutoUser123",
      replies: 12,
      likes: 24,
      category: "Обслуживание",
      categoryKk: "Қызмет көрсету",
      time: "2 часа назад"
    },
    {
      id: 2,
      title: "Рекомендации по зимним шинам",
      titleKk: "Қысқы шиналар бойынша ұсыныстар",
      author: "Driver456",
      replies: 8,
      likes: 15,
      category: "Аксессуары",
      categoryKk: "Аксессуарлар",
      time: "5 часов назад"
    },
    {
      id: 3,
      title: "Советы по диагностике двигателя",
      titleKk: "Қозғалтқышты диагностикалау бойынша кеңестер",
      author: "Mechanic789",
      replies: 20,
      likes: 35,
      category: "Ремонт",
      categoryKk: "Жөндеу",
      time: "1 день назад"
    },
    {
      id: 4,
      title: "Лучшие автосервисы в Алматы",
      titleKk: "Алматыдағы ең жақсы автосервистер",
      author: "CityDriver",
      replies: 15,
      likes: 28,
      category: "Сервисы",
      categoryKk: "Қызметтер",
      time: "2 дня назад"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('autoForum')}</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Search and Create */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по форуму..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{t('trendingTopics')}</h3>
                  <p className="text-sm text-muted-foreground">{t('joinConversation')}</p>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                {t('createNewPost')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Forum Posts */}
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card hover:bg-muted/30 transition-colors cursor-pointer hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-base leading-tight">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm text-muted-foreground">{t('by')} {post.author}</p>
                      <span className="text-xs text-muted-foreground">• {post.time}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{post.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{post.replies}</span>
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-medium">{post.likes}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoForum;
