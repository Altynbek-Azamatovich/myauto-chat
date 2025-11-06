import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe } from "lucide-react";

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+7");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: language === 'ru' 
          ? "Необходимо согласие с пользовательским соглашением" 
          : "Пайдаланушы келісіміне келісу қажет",
        variant: "destructive",
      });
      return;
    }

    if (phone.length < 12) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: language === 'ru' 
          ? "Введите корректный номер телефона" 
          : "Дұрыс телефон нөмірін енгізіңіз",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Sending OTP to:', phone);
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phone }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send OTP');
      }

      console.log('OTP sent successfully:', data);
      
      localStorage.setItem('auth_phone', phone);
      toast({
        title: language === 'ru' ? "Код отправлен" : "Код жіберілді",
        description: language === 'ru' 
          ? "Проверьте SMS сообщения" 
          : "SMS хабарламаларын тексеріңіз",
      });
      
      navigate('/otp-verify');
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: error.message || (language === 'ru' 
          ? "Не удалось отправить код" 
          : "Кодты жіберу мүмкін болмады"),
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

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('phoneAuth')}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8">
          {t('enterPhone')}
        </p>

        {/* Phone Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <span className="text-2xl">🇰🇿</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (XXX) XXX XX XX"
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 mb-8">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="agree" className="text-sm text-foreground">
            {t('agree')}{' '}
            <span className="text-primary underline cursor-pointer">
              {t('userAgreement')}
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !agreed}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90"
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
};

export default PhoneAuth;
