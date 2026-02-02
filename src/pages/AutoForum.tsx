import { useState } from "react";
import { ArrowLeft, MessageCircle, ThumbsUp, TrendingUp, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

const AutoForum = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = usePersistedState("autoforum_search_query", "");

  const posts = [
    {
      id: 1,
      title: "Лучшее масло для Toyota Camry",
      author: "AutoUser123",
      replies: 12,
      likes: 24,
      category: "Обслуживание",
      time: "2 часа назад"
    },
    {
      id: 2,
      title: "Рекомендации по зимним шинам",
      author: "Driver456",
      replies: 8,
      likes: 15,
      category: "Аксессуары",
      time: "5 часов назад"
    },
    {
      id: 3,
      title: "Советы по диагностике двигателя",
      author: "Mechanic789",
      replies: 20,
      likes: 35,
      category: "Ремонт",
      time: "1 день назад"
    },
    {
      id: 4,
      title: "Лучшие автосервисы в Алматы",
      author: "CityDriver",
      replies: 15,
      likes: 28,
      category: "Сервисы",
      time: "2 дня назад"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">{t('autoForum')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <ServiceUnderDevelopment />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по форуму..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-0 bg-muted/50 rounded-xl h-11"
          />
        </div>
        
        {/* Create Post */}
        <div className="bg-muted/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{t('trendingTopics')}</h3>
              <p className="text-xs text-muted-foreground">{t('joinConversation')}</p>
            </div>
          </div>
          <Button className="w-full h-10 rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            {t('createNewPost')}
          </Button>
        </div>

        {/* Forum Posts */}
        <div className="space-y-2">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="bg-muted/30 hover:bg-muted/50 transition-colors rounded-2xl p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-sm flex-1">{post.title}</h3>
                <Badge variant="secondary" className="shrink-0 text-xs">{post.category}</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>{t('by')} {post.author}</span>
                <span>•</span>
                <span>{post.time}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{post.replies}</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{post.likes}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoForum;
