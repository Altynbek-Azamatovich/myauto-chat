import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Format phone number as +7 XXX XXX XXXX
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (!cleaned.startsWith('7')) {
      return '+7 ';
    }

    let formatted = '+7 ';
    
    if (cleaned.length > 1) {
      formatted += cleaned.slice(1, 4);
    }
    
    if (cleaned.length > 4) {
      formatted += ' ' + cleaned.slice(4, 7);
    }
    
    if (cleaned.length > 7) {
      formatted += ' ' + cleaned.slice(7, 11);
    }

    return formatted;
  };

  const isPhoneValid = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const handleSubmit = async () => {
    if (!isLogin && !agreed) {
      toast({
        title: t('error'),
        description: t('mustAgree'),
        variant: "destructive",
      });
      return;
    }

    if (!isPhoneValid(phone)) {
      toast({
        title: t('error'),
        description: t('invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${phone.replace(/\D/g, '')}@myauto.app`,
          password: password,
        });

        if (error) throw error;

        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', data.user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate('/profile-setup');
        } else {
          navigate('/');
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: `${phone.replace(/\D/g, '')}@myauto.app`,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              phone: phone
            }
          }
        });

        if (error) throw error;

        toast({
          title: t('success'),
          description: t('registrationSuccess'),
        });

        navigate('/profile-setup');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: t('error'),
        description: error.message || t('authError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? t('login') : t('registration')}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? t('loginDescription') : t('registrationDescription')}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          {/* Phone Input */}
          <div className="relative">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 XXX XXX XXXX"
              className="h-14 text-lg pl-4 bg-card"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="h-14 text-lg pl-4 pr-12 bg-card"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password Input (only for registration) */}
          {!isLogin && (
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPassword')}
                className="h-14 text-lg pl-4 pr-12 bg-card"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          )}

          {/* Forgot Password Link (only for login) */}
          {isLogin && (
            <div className="text-right">
              <Button
                variant="link"
                onClick={() => navigate('/forgot-password')}
                className="text-primary p-0 h-auto"
              >
                {t('forgotPassword')}
              </Button>
            </div>
          )}

          {/* Terms Checkbox (only for registration) */}
          {!isLogin && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-tight cursor-pointer"
              >
                {t('agree')}{' '}
                <span className="text-primary underline">
                  {t('userAgreement')}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 mb-4"
        >
          {isLoading ? t('loading') : (isLogin ? t('loginButton') : t('registerButton'))}
        </Button>

        {/* Toggle Login/Register */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setPassword("");
              setConfirmPassword("");
              setAgreed(false);
            }}
            className="text-muted-foreground"
          >
            {isLogin ? t('noAccount') : t('haveAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneAuth;
