import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Eye, EyeOff, HelpCircle } from "lucide-react";

const OTPVerify = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: language === 'ru' 
          ? "Введите код из 6 цифр" 
          : "6 таңбалы кодты енгізіңіз",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const phone = localStorage.getItem('auth_phone');
      if (!phone) throw new Error('Phone not found');

      console.log('Verifying OTP:', { phone, code: otp });

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code: otp }
      });

      if (error) {
        console.error('Error verifying OTP:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid OTP code');
      }

      console.log('OTP verified successfully:', data);

      // Use the session data to log in
      if (data.session) {
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.session.properties.access_token,
          refresh_token: data.session.properties.refresh_token
        });

        if (signInError) {
          console.error('Error setting session:', signInError);
          throw signInError;
        }
      }

      toast({
        title: language === 'ru' ? "Успешно" : "Сәтті",
        description: language === 'ru' 
          ? "Вы успешно вошли в систему" 
          : "Сіз жүйеге сәтті кірдіңіз",
      });

      // Navigate based on whether user is new
      if (data.isNewUser) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error in handleVerify:', error);
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: error.message || (language === 'ru' 
          ? "Неверный код" 
          : "Қате код"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const phone = localStorage.getItem('auth_phone');
    if (!phone) return;

    try {
      console.log('Resending OTP to:', phone);
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone }
      });

      if (error) {
        console.error('Error resending OTP:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to resend OTP');
      }

      setResendTimer(60);
      toast({
        title: language === 'ru' ? "Код отправлен" : "Код жіберілді",
        description: language === 'ru' 
          ? "Новый код отправлен на ваш номер" 
          : "Жаңа код нөміріңізге жіберілді",
      });
    } catch (error: any) {
      console.error('Error in handleResend:', error);
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: error.message || (language === 'ru' 
          ? "Не удалось отправить код" 
          : "Кодты жіберу мүмкін болмады"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('enterOTP')}</h1>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Subtitle */}
        <p className="text-muted-foreground mb-6">
          {t('enterCode')}
        </p>

        {/* OTP Input */}
        <div className="mb-6 relative">
          <Input
            type={showOtp ? "text" : "password"}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={language === 'ru' ? "Введите ваш пароль" : "Құпия сөзіңізді енгізіңіз"}
            className="h-14 text-lg rounded-2xl pr-12"
            maxLength={6}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOtp(!showOtp)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>

        {/* Resend Code */}
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5 text-primary" />
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {t('resendCode')}
          </button>
        </div>

        {/* Timer */}
        {resendTimer > 0 && (
          <p className="text-foreground mb-8">
            {t('availableIn')} <span className="font-bold">{resendTimer}</span>
          </p>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 mt-auto"
        >
          {t('next')}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerify;
