import { ArrowLeft, MessageCircle, ThumbsUp, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoForum = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const posts = [
    {
      id: 1,
      title: "Best oil for Toyota Camry",
      author: "AutoUser123",
      replies: 12,
      likes: 24,
      category: "Maintenance"
    },
    {
      id: 2,
      title: "Winter tire recommendations",
      author: "Driver456",
      replies: 8,
      likes: 15,
      category: "Accessories"
    },
    {
      id: 3,
      title: "Engine diagnostic tips",
      author: "Mechanic789",
      replies: 20,
      likes: 35,
      category: "Repair"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/services')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{t('autoForum')}</h1>
      </header>

      <div className="p-4 space-y-4">
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">Trending Topics</h3>
                <p className="text-sm text-muted-foreground">Join the conversation</p>
              </div>
            </div>
            <Button className="w-full">Create New Post</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="bg-card hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">by {post.author}</p>
                  </div>
                  <Badge variant="secondary">{post.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {post.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {post.likes}
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