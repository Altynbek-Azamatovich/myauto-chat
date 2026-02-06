import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

type Channel = 'whatsapp' | 'sms';

const OTPVerify = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastChannel, setLastChannel] = useState<Channel>('whatsapp');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const phone = localStorage.getItem('auth_phone') || '';

  useEffect(() => {
    if (!phone) {
      navigate('/phone-auth');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [phone, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 11) return phone;
    return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
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
          : language === 'kk' ? "4 таңбалы кодты енгізіңіз" : "Enter 4-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phone, code: otpCode }
      });

      if (error) {
        let serverBody: any = null;
        try {
          const ctx = (error as any)?.context;
          if (ctx && typeof ctx.json === 'function') {
            serverBody = await ctx.json();
          }
        } catch { /* ignore */ }

        const err: any = new Error(serverBody?.error || error.message || 'Unknown error');
        err.shouldResendCode = !!serverBody?.shouldResendCode;
        throw err;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Invalid OTP code');
      }

      if (data.session) {
        const accessToken = data.session.access_token ?? data.session.properties?.access_token;
        const refreshToken = data.session.refresh_token ?? data.session.properties?.refresh_token;

        if (!accessToken || !refreshToken) {
          throw new Error(language === 'ru'
            ? 'Внутренняя ошибка. Запросите код повторно.'
            : language === 'kk' ? 'Ішкі қате. Кодты қайта сұраңыз.' : 'Internal error. Request a new code.');
        }

        const { error: signInError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (signInError) throw signInError;
      }

      toast({
        title: language === 'ru' ? "Успешно" : language === 'kk' ? "Сәтті" : "Success",
        description: language === 'ru' 
          ? "Вы успешно вошли в систему" 
          : language === 'kk' ? "Сіз жүйеге сәтті кірдіңіз" : "You have successfully signed in",
      });

      localStorage.removeItem('auth_phone');

      if (data.isNewUser) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      
      const shouldResend = !!error?.shouldResendCode;
      
      toast({
        title: t('error'),
        description: error.message || (language === 'ru' 
          ? (shouldResend ? "Внутренняя ошибка. Запросите код повторно." : "Неверный код")
          : language === 'kk' ? (shouldResend ? "Ішкі қате. Кодты қайта сұраңыз." : "Қате код") : (shouldResend ? "Internal error. Request a new code." : "Invalid code")),
        variant: "destructive",
      });
      
      if (shouldResend) {
        setResendTimer(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (channel: Channel) => {
    if (resendTimer > 0) return;
    
    const newAttemptCount = resendAttempts + 1;
    
    try {
      const functionName = channel === 'sms' ? 'send-sms' : 'send-otp';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { phone, language }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to send code');

      setResendAttempts(newAttemptCount);
      setLastChannel(channel);
      
      // Progressive timer: after 2 attempts, 2 min wait
      if (newAttemptCount >= 2) {
        setResendTimer(120);
      } else {
        setResendTimer(60);
      }

      toast({
        title: channel === 'sms' ? t('codeSentSms') : t('codeSentWhatsApp'),
        description: channel === 'sms' ? t('codeSentSmsDesc') : t('codeSentWhatsAppDesc'),
      });
      
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || (language === 'ru' 
          ? "Не удалось отправить код" 
          : language === 'kk' ? "Кодты жіберу мүмкін болмады" : "Failed to send code"),
        variant: "destructive",
      });
    }
  };

  const showResendOptions = resendTimer === 0;

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

        {/* Subtitle - channel-aware */}
        <p className="text-foreground mb-8">
          {lastChannel === 'sms' ? t('smsCodeSentTo') : t('whatsappCodeSentTo')}{' '}
          <span className="font-medium whitespace-nowrap inline-block">
            {formatPhoneDisplay(phone)}
          </span>
        </p>

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

        {/* Resend options */}
        <div className="text-center space-y-3">
          {resendTimer > 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('resendCode')} ({resendTimer})
            </p>
          ) : (
            <>
              <button
                onClick={() => handleResend('whatsapp')}
                className="block w-full text-primary font-medium"
              >
                {t('resendWhatsApp')}
              </button>
              <button
                onClick={() => handleResend('sms')}
                className="block w-full text-muted-foreground text-sm"
              >
                {t('sendSms')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
