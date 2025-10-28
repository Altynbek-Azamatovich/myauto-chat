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
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">СуперЧат</h1>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <Bell className="h-6 w-6" />
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <Card className={`max-w-[80%] p-3 ${
                msg.isBot 
                  ? 'bg-muted text-foreground' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {msg.isBot ? 'Gemini AI' : 'Вы'} • {msg.timestamp}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.isBot !== true && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-muted text-foreground">
                <p className="text-sm">Думаю...</p>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background pb-24">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Сообщение"
              className="pr-20 rounded-full bg-muted border-0"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full"
              onClick={() => {
                toast({
                  title: "Голосовое общение будет доступно после обновления",
                  description: "Мы работаем над этой функцией"
                });
              }}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={handleSendMessage}
            size="icon" 
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperChat;