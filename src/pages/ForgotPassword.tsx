import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+7");
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+7')) {
      return '+7';
    }
    
    const digits = cleaned.slice(2);
    const limitedDigits = digits.slice(0, 10);
    
    let formatted = '+7';
    if (limitedDigits.length > 0) {
      formatted += ' ' + limitedDigits.slice(0, 3);
    }
    if (limitedDigits.length > 3) {
      formatted += ' ' + limitedDigits.slice(3, 6);
    }
    if (limitedDigits.length > 6) {
      formatted += ' ' + limitedDigits.slice(6, 10);
    }
    
    return formatted;
  };

  const isPhoneValid = (phone: string) => {
    const phoneRegex = /^\+7 \d{3} \d{3} \d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    if (!isPhoneValid(phone)) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: language === 'ru' 
          ? "Введите корректный номер телефона в формате +7 XXX XXX XXXX" 
          : "Телефон нөмірін +7 XXX XXX XXXX форматында енгізіңіз",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: cleanPhone }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send SMS');
      }

      toast({
        title: language === 'ru' ? "SMS отправлено" : "SMS жіберілді",
        description: language === 'ru' 
          ? "Проверьте SMS с инструкциями для восстановления пароля" 
          : "Құпия сөзді қалпына келтіру нұсқауларымен SMS тексеріңіз",
      });
      
      setTimeout(() => navigate('/phone-auth'), 2000);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: error.message || (language === 'ru' ? "Не удалось отправить SMS" : "SMS жіберу мүмкін болмады"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'ru' ? 'РУ' : 'ҚЗ'}
        </Button>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/phone-auth')}
        className="absolute top-4 left-4 z-10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {language === 'ru' ? 'Назад' : 'Артқа'}
      </Button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {language === 'ru' ? 'Восстановление пароля' : 'Құпия сөзді қалпына келтіру'}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8">
          {language === 'ru' 
            ? 'Введите номер телефона для получения инструкций' 
            : 'Нұсқауларды алу үшін телефон нөмірін енгізіңіз'}
        </p>

        {/* Phone Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <span className="text-2xl">🇰🇿</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 XXX XXX XXXX"
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90"
        >
          {language === 'ru' ? 'Отправить' : 'Жіберу'}
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
