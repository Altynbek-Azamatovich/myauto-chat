import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
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

  const getPhoneDisplay = () => {
    const digits = phone.replace(/[^\d]/g, '').slice(1); // Remove +7
    let display = '+7 ';
    
    // Format: +7 ___ __ __ __
    const parts = ['___', '__', '__', '__'];
    let digitIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      let part = '';
      for (let j = 0; j < parts[i].length; j++) {
        if (digitIndex < digits.length) {
          part += digits[digitIndex];
          digitIndex++;
        } else {
          part += '_';
        }
      }
      parts[i] = part;
    }
    
    return display + parts.join(' ');
  };

  const isPhoneValid = (phone: string) => {
    const phoneRegex = /^\+7 \d{3} \d{3} \d{4}$/;
    return phoneRegex.test(phone);
  };

  const clearPhone = () => {
    setPhone("+7");
  };

  const handleSubmit = async () => {
    if (!isPhoneValid(phone)) {
      toast({
        title: t('error'),
        description: t('invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      
      // Store phone for OTP verification
      localStorage.setItem('auth_phone', cleanPhone);
      
      // Send OTP via edge function
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: cleanPhone, language }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send SMS');
      }

      toast({
        title: t('smsSent'),
        description: t('smsSentDescription'),
      });
      
      navigate('/otp-verify');
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      toast({
        title: t('error'),
        description: error.message || t('smsError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/welcome')}
          className="text-primary"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {/* Language Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full px-4">
              {language === 'ru' ? 'RU' : language === 'kk' ? 'KZ' : 'EN'} ▼
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('ru')}>
              Русский
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('kk')}>
              Қазақша
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          {t('welcomeTitle')}
        </h1>

        {/* Subtitle - two lines with same spacing as terms */}
        <div className="mb-8">
          <p className="text-foreground">
            {t('enterPhoneTitle')}
          </p>
          <p className="text-muted-foreground">
            {t('forLoginOrRegister')}
          </p>
        </div>

        {/* Phone Input */}
        <div className="mb-8">
          <div className="flex items-center gap-3 p-4 border border-input rounded-2xl bg-card">
            <span className="text-2xl">🇰🇿</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 ___ __ __ __"
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0 bg-transparent"
            />
            {phone !== "+7" && (
              <button
                onClick={clearPhone}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !isPhoneValid(phone)}
          className="w-full h-14 text-lg rounded-2xl font-medium"
        >
          {t('next')}
        </Button>

        {/* Terms Agreement - two lines */}
        <div className="text-sm text-muted-foreground text-center mt-6">
          <p>{t('byClickingNextLine1')}</p>
          <p>
            {t('byClickingNextLine2')}{' '}
            <button 
              onClick={() => navigate('/privacy-policy')}
              className="text-foreground underline"
            >
              {t('publicOffer')}
            </button>
          </p>
        </div>

        {/* Version */}
        <p className="text-xs text-muted-foreground text-center mt-auto pt-8">
          ver.: 1.0.0
        </p>
      </div>
    </div>
  );
};

export default PhoneAuth;
