import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Plus, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/logo.png";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: "сейчас"
    };

    setMessages(prev => [...prev, userMessage]);
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
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>

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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className="relative max-w-[80%]">
                <Card className={`p-3 rounded-3xl relative ${
                  msg.isBot 
                    ? 'bg-muted text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-xs mt-1 opacity-70`}>
                    {msg.isBot ? 'Gemini AI' : 'Вы'} • {msg.timestamp}
                  </p>
                </Card>
                {/* Message tail */}
                {msg.isBot ? (
                  <div className="absolute bottom-0 left-0 -ml-2 w-5 h-5 overflow-hidden">
                    <div className="w-3 h-3 bg-muted rotate-45 translate-x-2 translate-y-1"></div>
                  </div>
                ) : (
                  <div className="absolute bottom-0 right-0 -mr-2 w-5 h-5 overflow-hidden">
                    <div className="w-3 h-3 bg-primary rotate-45 -translate-x-2 translate-y-1"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.isBot !== true && (
            <div className="flex justify-start">
              <div className="relative max-w-[80%]">
                <Card className="p-3 rounded-3xl bg-muted text-foreground">
                  <p className="text-sm">Думаю...</p>
                </Card>
                <div className="absolute bottom-0 left-0 -ml-2 w-5 h-5 overflow-hidden">
                  <div className="w-3 h-3 bg-muted rotate-45 translate-x-2 translate-y-1"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

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