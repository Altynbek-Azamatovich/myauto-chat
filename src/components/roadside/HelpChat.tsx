import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface HelpChatProps {
  helpRequestId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    phone_number?: string;
    car_brand?: string | null;
    car_model?: string | null;
  };
  requestMessage: string;
  isRequester: boolean;
  onBack: () => void;
}

export const HelpChat = ({ 
  helpRequestId, 
  currentUserId, 
  otherUser, 
  requestMessage,
  isRequester,
  onBack 
}: HelpChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserName = otherUser.first_name || 'Водитель';
  const otherUserInitials = (otherUser.first_name?.[0] || 'В') + (otherUser.last_name?.[0] || '');
  const carInfo = [otherUser.car_brand, otherUser.car_model].filter(Boolean).join(' ');

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    fetchMessages();
    
    const channel = supabase
      .channel(`help-chat-${helpRequestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'help_chat_messages',
          filter: `help_request_id=eq.${helpRequestId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            // Prevent duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [helpRequestId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('help_chat_messages')
      .select('*')
      .eq('help_request_id', helpRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    
    if (data) {
      setMessages(data as ChatMessage[]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    
    const { error } = await supabase
      .from('help_chat_messages')
      .insert({
        help_request_id: helpRequestId,
        sender_id: currentUserId,
        message: messageText,
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Не удалось отправить сообщение');
      setNewMessage(messageText); // Restore message on error
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCall = () => {
    if (otherUser.phone_number) {
      window.location.href = `tel:${otherUser.phone_number}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[1002] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card safe-area-top">
        <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar_url || ''} alt={otherUserName} />
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {otherUserInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-base">{otherUserName}</div>
          {carInfo && (
            <div className="text-sm text-muted-foreground truncate">🚗 {carInfo}</div>
          )}
        </div>
        
        {otherUser.phone_number && (
          <Button variant="ghost" size="icon" onClick={handleCall} className="flex-shrink-0 text-primary">
            <Phone className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Request info banner */}
      <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-muted-foreground">
              {isRequester ? 'Ваша проблема: ' : 'Проблема: '}
            </span>
            <span className="text-foreground">{requestMessage}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-base">Начните переписку, чтобы обсудить детали</p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-base whitespace-pre-wrap">{msg.message}</p>
                <div className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card safe-area-bottom">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 rounded-full text-base h-12"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="rounded-full flex-shrink-0 h-12 w-12"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpChat;
