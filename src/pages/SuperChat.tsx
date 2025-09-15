import { useState } from "react";
import { Menu, Bell, Plus, Mic, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import logoImage from "@/assets/logo.png";

const SuperChat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Привет! Я твой Супер помощник по авто. Сейчас я в процессе обучения, чтобы помогать тебе максимально эффективно! 🚗",
      isBot: true,
      timestamp: "сейчас"
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      isBot: false,
      timestamp: "сейчас"
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Auto-reply from bot
    setTimeout(() => {
      const botReply = {
        id: messages.length + 2,
        text: "Спасибо за ваш вопрос! Я пока в процессе обучения и скоро смогу предоставить вам детальный ответ. Пожалуйста, ожидайте обновления! 🔧",
        isBot: true,
        timestamp: "сейчас"
      };
      setMessages(prev => [...prev, botReply]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted">
          <Menu className="h-6 w-6" />
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Auto-GPT</h1>
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
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 opacity-70`}>
                  {msg.isBot ? 'Auto-GPT' : 'Вы'} • {msg.timestamp}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background pb-20">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Заказать"
              className="pr-20 rounded-full bg-muted border-0"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full"
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