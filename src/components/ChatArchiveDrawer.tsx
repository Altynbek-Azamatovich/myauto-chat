import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatArchiveDrawerProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export const ChatArchiveDrawer = ({ 
  currentConversationId, 
  onSelectConversation,
  onNewChat
}: ChatArchiveDrawerProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    setConversations(data || []);
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить чат",
        variant: "destructive"
      });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (conversationId === currentConversationId) {
      onNewChat();
    }

    toast({
      title: "Чат удален",
      description: "История чата успешно удалена"
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Архив Чатов</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4">
          <Button 
            onClick={() => {
              onNewChat();
              setIsOpen(false);
            }}
            className="w-full mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Новый чат
          </Button>

          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group ${
                    conversation.id === currentConversationId ? 'bg-muted' : ''
                  }`}
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(conversation.updated_at), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  У вас пока нет сохраненных чатов
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
