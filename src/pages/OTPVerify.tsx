import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const OTPVerify = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const phone = localStorage.getItem('auth_phone') || '';

  useEffect(() => {
    if (!phone) {
      navigate('/phone-auth');
      return;
    }
    
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [phone, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhoneDisplay = (phone: string) => {
    // Format: +7 777 237 3000
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 11) return phone;
    
    return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits entered
    if (newOtp.every(d => d !== '') && index === 3) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 4) {
      toast({
        title: t('error'),
        description: language === 'ru' 
          ? "Введите код из 4 цифр" 
          : "4 таңбалы кодты енгізіңіз",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying OTP:', { phone, code: otpCode });

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code: otpCode }
      });

      if (error) {
        console.error('Error verifying OTP:', error);

        // Try to read error body from the function response
        let serverBody: any = null;
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === 'function') {
            serverBody = await ctx.json();
          }
        } catch {
          // ignore
        }

        const err: any = new Error(serverBody?.error || error.message || 'Unknown error');
        err.shouldResendCode = !!serverBody?.shouldResendCode;
        throw err;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid OTP code');
      }

      console.log('OTP verified successfully:', data);

      // Use the session data to log in
      if (data.session) {
        const accessToken = data.session.access_token ?? data.session.properties?.access_token;
        const refreshToken = data.session.refresh_token ?? data.session.properties?.refresh_token;

        if (!accessToken || !refreshToken) {
          throw new Error(language === 'ru'
            ? 'Внутренняя ошибка. Запросите SMS код повторно.'
            : 'Ішкі қате. SMS кодын қайта сұраңыз.');
        }

        const { error: signInError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
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

      // Clear stored phone
      localStorage.removeItem('auth_phone');

      // Navigate based on whether user is new
      if (data.isNewUser) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error in handleVerify:', error);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      // Check if we should suggest resending the code
      const shouldResend = !!error?.shouldResendCode;
      
      toast({
        title: t('error'),
        description: error.message || (language === 'ru' 
          ? (shouldResend ? "Внутренняя ошибка. Запросите SMS код повторно." : "Неверный код")
          : (shouldResend ? "Ішкі қате. SMS кодын қайта сұраңыз." : "Қате код")),
        variant: "destructive",
      });
      
      // If server suggests resending, reset the timer to allow immediate resend
      if (shouldResend) {
        setResendTimer(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
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
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      toast({
        title: language === 'ru' ? "Код отправлен" : "Код жіберілді",
        description: language === 'ru' 
          ? "Новый код отправлен на ваш номер" 
          : "Жаңа код нөміріңізге жіберілді",
      });
    } catch (error: any) {
      console.error('Error in handleResend:', error);
      toast({
        title: t('error'),
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
          onClick={() => navigate('/phone-auth')}
          className="text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {t('enterSmsCode')}
        </h1>

        {/* Subtitle with phone number - kept on single line */}
        <div className="mb-8">
          <p className="text-foreground">
            {t('smsCodeSentTo')}
          </p>
          <p className="text-foreground font-medium whitespace-nowrap">
            {formatPhoneDisplay(phone)}
          </p>
        </div>

        {/* OTP Input - 4 boxes */}
        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-input rounded-xl bg-muted/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
            />
          ))}
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-muted-foreground disabled:opacity-50"
          >
            {t('resendCode')}{resendTimer > 0 && ` (${resendTimer})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
