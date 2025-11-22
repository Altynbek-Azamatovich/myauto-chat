import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, Eye, EyeOff, ArrowLeft } from "lucide-react";

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+7");
  const [partnerLogin, setPartnerLogin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const pendingRole = (localStorage.getItem('pending_role') || 'user') as 'user' | 'partner';
  const isPartnerMode = pendingRole === 'partner';

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

  const isPartnerLoginValid = (login: string) => {
    // Check if login matches 2 letters + 4 digits format
    const loginRegex = /^[A-Za-z]{2}\d{4}$/;
    return loginRegex.test(login);
  };

  const validatePassword = (password: string, forRegistration: boolean = false) => {
    // For login, only check that password is not empty
    if (!forRegistration) {
      if (password.length === 0) {
        return { valid: false, error: t('enterPassword') };
      }
      return { valid: true };
    }

    // For registration, apply strict validation
    if (password.length < 8) {
      return { valid: false, error: 'Пароль должен содержать минимум 8 символов' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Пароль должен содержать хотя бы одну заглавную букву' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Пароль должен содержать хотя бы одну строчную букву' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, error: t('passwordNeedsNumber') };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Пароль должен содержать хотя бы один специальный символ' };
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    // Validate input based on mode
    if (isPartnerMode) {
      if (!isPartnerLoginValid(partnerLogin)) {
        toast({
          title: t('error'),
          description: language === 'ru' 
            ? 'Неверный формат логина. Используйте 2 буквы и 4 цифры (например: AA1111)'
            : 'Логин форматы қате. 2 әріп және 4 сан пайдаланыңыз (мысалы: AA1111)',
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!isPhoneValid(phone)) {
        toast({
          title: t('error'),
          description: t('invalidPhone'),
          variant: "destructive",
        });
        return;
      }
    }

    // Apply strict validation only for registration
    const passwordValidation = validatePassword(password, isRegisterMode);
    if (!passwordValidation.valid) {
      toast({
        title: t('error'),
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    // For user registration, check password confirmation and agreement
    if (isRegisterMode && !isPartnerMode) {
      if (password !== confirmPassword) {
        toast({
          title: t('error'),
          description: t('passwordsNotMatch'),
          variant: "destructive",
        });
        return;
      }

      if (!agreed) {
        toast({
          title: t('error'),
          description: t('userAgreementRequired'),
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      
      if (isPartnerMode) {
        // Partner login only - no registration
        const partnerEmail = `${partnerLogin.toLowerCase()}@partner.myauto.kz`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: partnerEmail,
          password: password,
        });

        if (error) throw error;

        // Check if user has partner role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'partner')
          .maybeSingle();

        if (!roleData) {
          await supabase.auth.signOut();
          throw new Error(t('partnerAccessDenied'));
        }

        toast({
          title: t('success'),
          description: t('loginComplete'),
        });
        
        localStorage.removeItem('pending_role');
        
        // Check if partner is verified
        const { data: partnerData } = await supabase
          .from('service_partners')
          .select('is_verified')
          .eq('owner_id', data.user.id)
          .maybeSingle();

        if (partnerData && !partnerData.is_verified) {
          navigate('/partner/pending-verification');
        } else {
          navigate('/partner/dashboard');
        }
      } else {
        // User registration or login
        if (isRegisterMode) {
          // Register new user
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            phone: cleanPhone,
            password: password,
          });

          if (signUpError) {
            if (signUpError.message?.includes('already') || signUpError.message?.includes('registered')) {
              throw new Error(t('phoneAlreadyRegistered'));
            }
            throw signUpError;
          }

          if (!authData.user) throw new Error('Registration failed');

          toast({
            title: t('success'),
            description: t('registrationComplete'),
          });
          
          localStorage.removeItem('pending_role');
          navigate('/profile-setup');
        } else {
          // User login
          const { data, error } = await supabase.auth.signInWithPassword({
            phone: cleanPhone,
            password: password,
          });

          if (error) throw error;

          toast({
            title: t('success'),
            description: t('loginComplete'),
          });
          
          localStorage.removeItem('pending_role');
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      let errorMessage = error.message || (language === 'ru' ? "Произошла ошибка" : "Қате орын алды");
      
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = isPartnerMode 
          ? t('invalidPartnerCredentials')
          : t('invalidCredentials');
      }
      
      toast({
        title: t('error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

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
          {isPartnerMode 
            ? t('partnerLogin')
            : (isRegisterMode ? t('register') : t('login'))
          }
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8">
          {isPartnerMode 
            ? (language === 'ru' ? 'Введите логин и пароль' : 'Логин мен құпия сөзді енгізіңіз')
            : t('enterPhone')
          }
        </p>

        {/* Login/Phone Input */}
        <div className="mb-4">
          {isPartnerMode ? (
            <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
              <Input
                type="text"
                value={partnerLogin}
                onChange={(e) => setPartnerLogin(e.target.value.toUpperCase())}
                placeholder="AA1111"
                maxLength={6}
                className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>
          ) : (
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
          )}
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input (only in user register mode) */}
        {isRegisterMode && !isPartnerMode && (
          <div className="mb-4">
            <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPassword')}
                className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Link (only in login mode) */}
        {!isRegisterMode && !isPartnerMode && (
          <div className="mb-6 text-right">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>
        )}

        {/* Agreement Checkbox (only in user register mode) */}
        {isRegisterMode && !isPartnerMode && (
          <div className="flex items-start gap-3 mb-6">
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
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || (isRegisterMode && !isPartnerMode && !agreed)}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 mb-4"
        >
          {isPartnerMode 
            ? t('login')
            : (isRegisterMode ? t('register') : t('login'))
          }
        </Button>

        {/* Partner Application Link */}
        {isPartnerMode && (
          <div className="text-center mb-4">
            <button
              onClick={() => navigate('/partner-application')}
              className="text-sm text-primary hover:underline"
            >
              {t('getPartnerAccess')}
            </button>
          </div>
        )}

        {/* Toggle Mode Link (only for user) */}
        {!isPartnerMode && (
          <div className="text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setPassword("");
                setConfirmPassword("");
                setAgreed(false);
              }}
              className="text-sm text-muted-foreground"
            >
              {isRegisterMode ? t('haveAccount') : t('noAccount')}{' '}
              <span className="text-primary hover:underline">
                {isRegisterMode ? t('login') : t('register')}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneAuth;
