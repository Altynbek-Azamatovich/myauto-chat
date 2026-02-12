import { useState, useRef, useEffect, useCallback } from "react";
import { Menu, Bell, ArrowUp, Archive, Loader2, Trash2, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  isVoice?: boolean;
}

interface ArchivedSession {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const VOICE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-voice`;
const CHAT_STORAGE_KEY = 'myauto_chat_session';

const loadStoredChat = (defaultMessage: Message): Message[] => {
  try {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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

  useEffect(() => {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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

  useEffect(() => {
    const handleBeforeUnload = () => {
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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, userId, sessionStartTime]);

  const generateSessionTitle = (msgs: Message[]): string => {
    const firstUserMsg = msgs.find(m => !m.isBot);
    if (firstUserMsg) {
      return firstUserMsg.text.substring(0, 50) + (firstUserMsg.text.length > 50 ? '...' : '');
    }
    return 'Разговор ' + format(new Date(), 'd MMM HH:mm', { locale: ru });
  };

  const fetchArchivedSessions = async (uid: string) => {
    try {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`id, title, created_at, chat_messages (id, role, content, created_at)`)
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

  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // ===== TEXT CHAT =====
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
          toast({ title: "Слишком много запросов", description: "Подождите немного", variant: "destructive" });
        } else {
          throw new Error(errorData.error || "Ошибка");
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
                  return prev.map(m => m.id === assistantMessageId ? { ...m, text: assistantText } : m);
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
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Не удалось получить ответ", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ===== VOICE MODE =====
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          setIsProcessingVoice(false);
          return;
        }

        setIsProcessingVoice(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          // Send conversation history for context
          const history = messages.slice(-10).map(m => ({
            role: m.isBot ? "assistant" : "user",
            content: m.text
          }));
          formData.append('history', JSON.stringify(history));

          const response = await fetch(VOICE_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: formData,
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Ошибка голосового ответа');
          }

          const data = await response.json();

          // Add user transcript to chat
          if (data.userTranscript) {
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: data.userTranscript,
              isBot: false,
              timestamp: format(new Date(), 'HH:mm'),
              isVoice: true,
            }]);
          }

          // Add AI response to chat
          if (data.aiResponse) {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              text: data.aiResponse,
              isBot: true,
              timestamp: format(new Date(), 'HH:mm'),
              isVoice: true,
            }]);
          }

          // Play audio response
          if (data.audioBase64) {
            const audioBytes = Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0));
            const audioBlob2 = new Blob([audioBytes], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob2);
            const audio = new Audio(audioUrl);
            audio.onended = () => URL.revokeObjectURL(audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error('Voice error:', error);
          toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Ошибка голосового режима", variant: "destructive" });
        } finally {
          setIsProcessingVoice(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
      toast({ title: "Ошибка", description: "Не удалось получить доступ к микрофону", variant: "destructive" });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const resumeSession = (session: ArchivedSession) => {
    setMessages(session.messages);
    setSelectedSession(null);
    setActiveTab("chat");
    toast({ title: "Разговор возобновлён", description: session.title });
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await supabase.from('chat_messages').delete().eq('conversation_id', sessionId);
      await supabase.from('chat_conversations').delete().eq('id', sessionId);
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
          <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)} className="rounded-full hover:bg-muted/30">
            <Archive className="h-[20px] w-[20px] text-foreground" strokeWidth={2.5} />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-sm font-medium truncate px-4">{selectedSession.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(selectedSession.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => deleteSession(selectedSession.id)} className="rounded-full hover:bg-destructive/10 text-destructive">
            <Trash2 className="h-[20px] w-[20px]" strokeWidth={2.5} />
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pt-20 pb-24">
          <div className="space-y-4">
            {selectedSession.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] p-4 rounded-2xl ${msg.isBot ? 'bg-muted/80 text-foreground' : 'bg-primary text-primary-foreground'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">{msg.isBot ? 'myAuto AI' : t('you')} • {msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 py-3">
          <Button onClick={() => resumeSession(selectedSession)} className="w-full rounded-xl" size="lg">
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
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "chat" ? "bg-background text-primary" : "text-muted-foreground"}`}
          >
            {t('superChat')}
          </button>
          <button
            onClick={() => { setActiveTab("archive"); if (userId) fetchArchivedSessions(userId); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "archive" ? "bg-background text-primary" : "text-muted-foreground"}`}
          >
            Архив
          </button>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground" onClick={() => navigate('/notifications')}>
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
              <p className="text-sm text-muted-foreground">Ваши разговоры с ИИ будут сохраняться здесь автоматически</p>
            </div>
          ) : (
            <div className="space-y-3">
              {archivedSessions.map((session) => (
                <SwipeableItem key={session.id} onDelete={() => deleteSession(session.id)}>
                  <div className="p-4 bg-background cursor-pointer" onClick={() => setSelectedSession(session)}>
                    <p className="font-medium text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(session.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{session.messages.length} сообщений</p>
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
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                <div className={`max-w-[75%] p-4 rounded-2xl ${msg.isBot ? 'bg-muted/80 text-foreground' : 'bg-primary text-primary-foreground'}`}>
                  {msg.isVoice && (
                    <div className="flex items-center gap-1 mb-1">
                      <Volume2 className="h-3 w-3 opacity-60" />
                      <span className="text-xs opacity-60">голос</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs mt-2 opacity-60">{msg.isBot ? 'myAuto AI' : t('you')} • {msg.timestamp}</p>
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
            {isProcessingVoice && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[75%] p-4 rounded-2xl bg-muted/80 text-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Обрабатываю голос...</p>
                  </div>
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
          {/* Voice mode toggle */}
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${isVoiceMode ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}`}
            >
              {isVoiceMode ? '🎙 Голосовой режим' : '⌨️ Текстовый режим'}
            </button>
          </div>

          {isVoiceMode ? (
            /* Voice input */
            <div className="flex items-center justify-center">
              <Button
                onClick={toggleVoiceRecording}
                size="icon"
                disabled={isProcessingVoice}
                className={`rounded-full h-16 w-16 transition-all ${isRecording ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
              >
                {isProcessingVoice ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isRecording ? (
                  <MicOff className="h-7 w-7" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </Button>
            </div>
          ) : (
            /* Text input */
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
          )}
        </div>
      )}
    </div>
  );
};

export default SuperChat;
