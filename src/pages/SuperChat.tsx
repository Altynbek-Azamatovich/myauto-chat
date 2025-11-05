import { useState, useRef, useEffect } from "react";
import { Bell, Plus, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatArchiveDrawer } from "@/components/ChatArchiveDrawer";
import { CommunityPlaceholder } from "@/components/CommunityPlaceholder";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SuperChat = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "community">("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привет! Я твой AI помощник по авто. Сейчас я в процессе обучения, что бы помогать тебе максимально эффективно! 🚗",
      isBot: true,
      timestamp: "сейчас"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadOrCreateConversation();
  }, []);

  const loadOrCreateConversation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Try to load the most recent conversation
    const { data: conversations } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (conversations && conversations.length > 0) {
      await loadConversation(conversations[0].id);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: chatMessages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    if (chatMessages && chatMessages.length > 0) {
      const loadedMessages: Message[] = chatMessages.map(msg => ({
        id: Date.now() + Math.random(),
        text: msg.content,
        isBot: msg.role === 'assistant',
        timestamp: 'сейчас'
      }));
      setMessages(loadedMessages);
    } else {
      // If conversation has no messages, start with welcome message
      setMessages([{
        id: 1,
        text: "Привет! Я твой AI помощник по авто. Сейчас я в процессе обучения, что бы помогать тебе максимально эффективно! 🚗",
        isBot: true,
        timestamp: "сейчас"
      }]);
    }
  };

  const createNewConversation = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title: 'Новый чат'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data.id;
  };

  const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role,
        content
      });

    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([{
      id: 1,
      text: "Привет! Я твой AI помощник по авто. Сейчас я в процессе обучения, что бы помогать тебе максимально эффективно! 🚗",
      isBot: true,
      timestamp: "сейчас"
    }]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Create or get conversation ID
    let convId = currentConversationId;
    if (!convId) {
      convId = await createNewConversation();
      if (!convId) {
        toast({
          title: "Ошибка",
          description: "Не удалось создать чат",
          variant: "destructive"
        });
        return;
      }
      setCurrentConversationId(convId);
    }

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: "сейчас"
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to database
    await saveMessage(convId, 'user', message);
    
    setMessage("");
    setIsLoading(true);

    let assistantText = "";
    const assistantMessageId = Date.now() + 1;

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.isBot ? "assistant" : "user", content: m.text })),
            { role: "user", content: userMessage.text }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast({
            title: "Слишком много запросов",
            description: "Пожалуйста, подождите немного перед следующим вопросом",
            variant: "destructive"
          });
        } else if (response.status === 402) {
          toast({
            title: "Требуется оплата",
            description: "Необходимо пополнить баланс Lovable AI",
            variant: "destructive"
          });
        } else {
          throw new Error(errorData.error || "Ошибка сервиса");
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantText += content;
              setMessages(prev => {
                const existing = prev.find(m => m.id === assistantMessageId);
                if (existing) {
                  return prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, text: assistantText }
                      : m
                  );
                }
                return [...prev, {
                  id: assistantMessageId,
                  text: assistantText,
                  isBot: true,
                  timestamp: "сейчас"
                }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to database
      if (assistantText && convId) {
        await saveMessage(convId, 'assistant', assistantText);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось получить ответ",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <ChatArchiveDrawer 
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversation}
          onNewChat={handleNewChat}
        />

        <div className="flex items-center gap-1 bg-muted/50 backdrop-blur-lg rounded-full px-1 py-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "chat"
                ? "bg-white/70 text-primary"
                : "text-muted-foreground"
            }`}
          >
            СуперЧат
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "community"
                ? "bg-white/70 text-primary"
                : "text-muted-foreground"
            }`}
          >
            Сообщество
          </button>
        </div>

        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      {activeTab === "community" ? (
        <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32">
          <CommunityPlaceholder />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32">
          <div className="space-y-4">
            {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <Card className={`max-w-[75%] p-4 rounded-2xl border-0 shadow-sm ${
                msg.isBot 
                  ? 'bg-muted/80 text-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs mt-2 opacity-60">
                  {msg.isBot ? 'Gemini AI' : 'Вы'} • {msg.timestamp}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.isBot !== true && (
            <div className="flex justify-start animate-fade-in">
              <Card className="max-w-[75%] p-4 rounded-2xl border-0 shadow-sm bg-muted/80 text-foreground">
                <p className="text-sm">Думаю...</p>
              </Card>
            </div>
          )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-28 left-0 right-0 px-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex items-center bg-muted/30 backdrop-blur-lg rounded-full px-3 h-10 max-w-xl w-full">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Сообщение"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-8"
            />

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
              onClick={() => {
                toast({
                  title: "Голосовое общение будет доступно после обновления",
                  description: "Мы работаем над этой функцией"
                });
              }}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>

          <Button 
            onClick={handleSendMessage}
            size="icon" 
            className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
            disabled={isLoading || !message.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperChat;