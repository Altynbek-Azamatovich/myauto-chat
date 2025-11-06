import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Plus, Mic, ArrowUp, Users, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const SuperChat = () => {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "community">("chat");
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('superChatMessages');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        text: t('chatAiHelper'),
        isBot: true,
        timestamp: t('now')
      }
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('superChatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: t('now')
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
            title: t('tooManyRequests'),
            description: t('waitBefore'),
            variant: "destructive"
          });
        } else if (response.status === 402) {
          toast({
            title: t('paymentRequired'),
            description: t('needTopUp'),
            variant: "destructive"
          });
        } else {
          throw new Error(errorData.error || t('error'));
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
                  timestamp: t('now')
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
        title: t('error'),
        description: error instanceof Error ? error.message : t('couldNotGetResponse'),
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
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
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
            {t('superChat')}
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "community"
                ? "bg-white/70 text-primary"
                : "text-muted-foreground"
            }`}
          >
            {t('community')}
          </button>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
          <Bell className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      {activeTab === "community" ? (
        <div className="flex-1 overflow-y-auto px-4 pt-24 pb-32">
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
            <Card className="max-w-md w-full p-8 text-center space-y-6 bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
              <div className="flex justify-center">
                <div className="relative">
                  <Users className="h-16 w-16 text-primary" />
                  <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">
                  {t('communitySoon')}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t('workingOnCommunity')}
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('groupChats')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('chatWithOthers')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('thematicGroups')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('joinGroups')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('shareExperience')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('shareTips')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground italic">
                {t('stayTuned')} 🚀
              </p>
            </Card>
          </div>
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
                  {msg.isBot ? 'Gemini AI' : t('you')} • {msg.timestamp}
                </p>
              </Card>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.isBot !== true && (
            <div className="flex justify-start animate-fade-in">
              <Card className="max-w-[75%] p-4 rounded-2xl border-0 shadow-sm bg-muted/80 text-foreground">
                <p className="text-sm">{t('thinking')}</p>
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
              placeholder={t('message')}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-8"
            />

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 flex-shrink-0"
              onClick={() => {
                toast({
                  title: t('voiceChatSoon'),
                  description: t('workingOnFeature')
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