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

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +7
    if (!cleaned.startsWith('+7')) {
      return '+7';
    }
    
    // Get only digits after +7
    const digits = cleaned.slice(2);
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Format as +7 XXX XXX XXXX
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
    // Check if phone matches +7 XXX XXX XXXX format (exactly 10 digits after +7)
    const phoneRegex = /^\+7 \d{3} \d{3} \d{4}$/;
    return phoneRegex.test(phone);
  };

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
      console.log('Sending OTP to:', phone);
      
      // Remove spaces from phone number before sending
      const cleanPhone = phone.replace(/\s/g, '');
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: cleanPhone }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send OTP');
      }

      console.log('OTP sent successfully:', data);
      
      // Store phone without spaces
      localStorage.setItem('auth_phone', cleanPhone);
      toast({
        title: language === 'ru' ? "Код отправлен" : "Код жіберілді",
        description: language === 'ru' 
          ? "Проверьте SMS сообщения" 
          : "SMS хабарламаларын тексеріңіз",
      });
      
      navigate('/otp-verify');
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      let errorDescription = error.message;
      
      // Provide user-friendly error messages
      if (error.message?.includes('SMSC')) {
        errorDescription = language === 'ru' 
          ? "Проблема с SMS-сервисом. Попробуйте позже или свяжитесь с поддержкой."
          : "SMS қызметінде ақау. Кейінірек қайталап көріңіз немесе қолдау қызметіне хабарласыңыз.";
      } else if (!errorDescription) {
        errorDescription = language === 'ru' 
          ? "Не удалось отправить код" 
          : "Кодты жіберу мүмкін болмады";
      }
      
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: errorDescription,
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
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 XXX XXX XXXX"
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
