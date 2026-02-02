import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Bell, ArrowUp, Archive, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { SwipeableItem } from "@/components/SwipeableItem";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: string;
}

interface ArchivedSession {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const CHAT_STORAGE_KEY = 'myauto_chat_session';

// Load chat from sessionStorage (persists during browser session, clears on close)
const loadStoredChat = (defaultMessage: Message): Message[] => {
  try {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading chat from storage:', e);
  }
  return [defaultMessage];
};

const SuperChat = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "archive">("chat");
  
  // Initialize messages from sessionStorage to persist between section navigation
  const defaultMessage: Message = {
    id: 1,
    text: t('chatAiHelper'),
    isBot: true,
    timestamp: format(new Date(), 'HH:mm')
  };
  
  const [messages, setMessages] = useState<Message[]>(() => loadStoredChat(defaultMessage));
  const [isLoading, setIsLoading] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState<ArchivedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ArchivedSession | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save messages to sessionStorage whenever they change (persists between section navigation)
  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchArchivedSessions(user.id);
      }
    };
    getUser();
  }, []);

  // Auto-save session ONLY when app is closed (beforeunload), not on navigation
  // Minimum 4 messages required to save (2 user + 2 bot messages)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only save if there are at least 4 messages (meaningful conversation)
      if (messages.length >= 4 && userId) {
        const sessionData = {
          userId,
          messages,
          title: generateSessionTitle(messages),
          startTime: sessionStartTime.toISOString()
        };
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-chat-session`,
          JSON.stringify(sessionData)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // DO NOT save on unmount - this prevents saving on section navigation
    };
  }, [messages, userId, sessionStartTime]);

  const generateSessionTitle = (msgs: Message[]): string => {
    // Find first user message for title
    const firstUserMsg = msgs.find(m => !m.isBot);
    if (firstUserMsg) {
      return firstUserMsg.text.substring(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '');
    }
    return 'Разговор ' + format(new Date(), 'd MMM HH:mm', { locale: ru });
  };

  const cleanupOldSessions = async (uid: string) => {
    try {
      // Get all sessions ordered by date
      const { data: sessions } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (sessions && sessions.length > 10) {
        // Delete sessions beyond the 10 most recent
        const sessionsToDelete = sessions.slice(10);
        
        for (const session of sessionsToDelete) {
          await supabase.from('chat_messages').delete().eq('conversation_id', session.id);
          await supabase.from('chat_conversations').delete().eq('id', session.id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  };

  const fetchArchivedSessions = async (uid: string) => {
    try {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          title,
          created_at,
          chat_messages (
            id,
            role,
            content,
            created_at
          )
        `)
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions: ArchivedSession[] = (conversations || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        created_at: conv.created_at,
        messages: (conv.chat_messages || []).map((msg: any, idx: number) => ({
          id: idx,
          text: msg.content,
          isBot: msg.role === 'assistant',
          timestamp: format(new Date(msg.created_at), 'HH:mm')
        }))
      }));

      setArchivedSessions(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (inputText?: string) => {
    const textToSend = inputText || message;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      isBot: false,
      timestamp: format(new Date(), 'HH:mm')
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
          ],
          userId
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
                  timestamp: format(new Date(), 'HH:mm')
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

  const resumeSession = (session: ArchivedSession) => {
    setMessages(session.messages);
    setSelectedSession(null);
    setActiveTab("chat");
    toast({
      title: "Разговор возобновлён",
      description: session.title
    });
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Delete messages first
      await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', sessionId);

      // Delete conversation
      await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', sessionId);

      setArchivedSessions(prev => prev.filter(s => s.id !== sessionId));
      setSelectedSession(null);
      toast({ title: "Сессия удалена" });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  // Selected session view
  if (selectedSession) {
    return (
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-between px-4 py-4 z-20 bg-background/80 backdrop-blur-lg">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedSession(null)}
            className="rounded-full hover:bg-muted/30"
          >
            <Archive className="h-[20px] w-[20px] text-foreground" strokeWidth={2.5} />
          </Button>

          <div className="flex-1 text-center">
            <p className="text-sm font-medium truncate px-4">{selectedSession.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(selectedSession.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => deleteSession(selectedSession.id)}
            className="rounded-full hover:bg-destructive/10 text-destructive"
          >
            <Trash2 className="h-[20px] w-[20px]" strokeWidth={2.5} />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-24">
          <div className="space-y-4">
            {selectedSession.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[75%] p-4 rounded-2xl ${
                  msg.isBot 
                    ? 'bg-muted/80 text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {msg.isBot ? 'myAuto AI' : t('you')} • {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-3">
          <Button 
            onClick={() => resumeSession(selectedSession)}
            className="w-full rounded-xl"
            size="lg"
          >
            Продолжить разговор
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-between px-4 py-4 z-20 bg-background/80 backdrop-blur-lg">
        <AppSidebar 
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-[30px] w-[30px] text-foreground" strokeWidth={2.5} />
            </Button>
          }
        />

        <div className="flex items-center gap-0.5 bg-muted/50 backdrop-blur-lg rounded-full px-1 py-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "chat"
                ? "bg-background text-primary"
                : "text-muted-foreground"
            }`}
          >
            {t('superChat')}
          </button>
          <button
            onClick={() => {
              setActiveTab("archive");
              if (userId) fetchArchivedSessions(userId);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === "archive"
                ? "bg-background text-primary"
                : "text-muted-foreground"
            }`}
          >
            Архив
          </button>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-[30px] w-[30px] text-foreground" strokeWidth={2.5} />
        </Button>
      </header>

      {/* Archive Tab */}
      {activeTab === "archive" ? (
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-32">
          {archivedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <Archive className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Архив пуст</h3>
              <p className="text-sm text-muted-foreground">
                Ваши разговоры с ИИ будут сохраняться здесь автоматически
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedSessions.map((session) => (
                <SwipeableItem
                  key={session.id}
                  onDelete={() => deleteSession(session.id)}
                >
                  <div 
                    className="p-4 bg-background cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <p className="font-medium text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(session.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.messages.length} сообщений
                    </p>
                  </div>
                </SwipeableItem>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Chat Tab */
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-36">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div className={`max-w-[75%] p-4 rounded-2xl ${
                  msg.isBot 
                    ? 'bg-muted/80 text-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {msg.isBot ? 'myAuto AI' : t('you')} • {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.isBot !== true && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[75%] p-4 rounded-2xl bg-muted/80 text-foreground">
                  <p className="text-sm">{t('thinking')}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area */}
      {activeTab === "chat" && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-3 z-10">
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-muted/50 backdrop-blur-sm rounded-full px-4 h-12 flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('message')}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-10"
              />
            </div>

            <Button 
              onClick={() => handleSendMessage()}
              size="icon" 
              className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0 h-12 w-12"
              disabled={isLoading || !message.trim()}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperChat;