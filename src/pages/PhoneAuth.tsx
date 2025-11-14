import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, Eye, EyeOff } from "lucide-react";

const PhoneAuth = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+7");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
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

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return { valid: false, error: t('passwordTooShort') };
    }
    if (!/\d/.test(password)) {
      return { valid: false, error: t('passwordNeedsNumber') };
    }
    return { valid: true };
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        toast({
          title: language === 'ru' ? "Ошибка" : "Қате",
          description: t('passwordsNotMatch'),
          variant: "destructive",
        });
        return;
      }

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
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const pendingRole = (localStorage.getItem('pending_role') || 'user') as 'user' | 'partner';
      
      if (isRegisterMode) {
        // Check if user already exists with this phone
        const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
          phone: cleanPhone,
          password: password,
        });

        if (existingUser?.user) {
          // User exists and password is correct - check if they already have this role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', existingUser.user.id)
            .eq('role', pendingRole)
            .maybeSingle();

          if (existingRole) {
            // User already has this role
            const roleNames = {
              user: language === 'ru' ? 'пользователя' : 'пайдаланушының',
              partner: language === 'ru' ? 'партнера' : 'серіктестің'
            };
            
            throw new Error(
              t('accountAlreadyHasRole').replace('{role}', roleNames[pendingRole as 'user' | 'partner'])
            );
          }

          // Add the new role to existing user
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: existingUser.user.id,
              role: pendingRole as any
            }]);

          if (roleError) throw roleError;

          // If partner, create service_partners entry (unverified)
          if (pendingRole === 'partner') {
            const { error: partnerError } = await supabase
              .from('service_partners')
              .insert([{
                owner_id: existingUser.user.id,
                name: '',
                is_verified: false
              }]);

            if (partnerError) throw partnerError;
          }

          const roleNames = {
            user: language === 'ru' ? 'пользователя' : 'пайдаланушы',
            partner: language === 'ru' ? 'партнера' : 'серіктес'
          };

          toast({
            title: language === 'ru' ? "Успешно" : "Сәтті",
            description: t('roleAddedSuccess').replace('{role}', roleNames[pendingRole as 'user' | 'partner']),
          });
          
          localStorage.removeItem('pending_role');
          
          // Navigate based on role
          if (pendingRole === 'partner') {
            navigate('/partner/pending-verification');
          } else {
            navigate('/profile-setup');
          }
        } else {
          // User doesn't exist or wrong password - create new user
          const { data: authData, error } = await supabase.auth.signUp({
            phone: cleanPhone,
            password: password,
          });

          if (error) throw error;
          if (!authData.user) throw new Error('Registration failed');

          // Add role to user_roles table
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: authData.user.id,
              role: pendingRole as any
            }]);

          if (roleError) throw roleError;

          // If partner, create service_partners entry (unverified)
          if (pendingRole === 'partner') {
            const { error: partnerError } = await supabase
              .from('service_partners')
              .insert([{
                owner_id: authData.user.id,
                name: '',
                is_verified: false
              }]);

            if (partnerError) throw partnerError;
          }

          toast({
            title: language === 'ru' ? "Успешно" : "Сәтті",
            description: language === 'ru' 
              ? "Регистрация завершена" 
              : "Тіркелу аяқталды",
          });
          
          localStorage.removeItem('pending_role');
          
          // Navigate based on role
          if (pendingRole === 'partner') {
            navigate('/partner/pending-verification');
          } else {
            navigate('/profile-setup');
          }
        }
      } else {
        // Login - check if user has the selected role
        const { data, error } = await supabase.auth.signInWithPassword({
          phone: cleanPhone,
          password: password,
        });

        if (error) throw error;

        // Check if the user has the selected role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', pendingRole)
          .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
          // User doesn't have this role - sign out and show error
          await supabase.auth.signOut();
          
          const roleNames = {
            user: language === 'ru' ? 'пользователь' : 'пайдаланушы',
            partner: language === 'ru' ? 'партнер' : 'серіктес'
          };
          
          throw new Error(
            language === 'ru' 
              ? `У вас нет аккаунта ${roleNames[pendingRole as 'user' | 'partner']}. Пожалуйста, пройдите регистрацию для этой роли.`
              : `Сізде ${roleNames[pendingRole as 'user' | 'partner']} аккаунты жоқ. Бұл рөл үшін тіркеуден өтіңіз.`
          );
        }

        toast({
          title: language === 'ru' ? "Успешно" : "Сәтті",
          description: language === 'ru' 
            ? "Вход выполнен" 
            : "Кіру орындалды",
        });
        
        localStorage.removeItem('pending_role');
        
        // Navigate based on role
        if (pendingRole === 'partner') {
          // Check if partner is verified
          const { data: partnerData } = await supabase
            .from('service_partners')
            .select('is_verified')
            .eq('owner_id', data.user.id)
            .single();

          if (partnerData && !partnerData.is_verified) {
            navigate('/partner/pending-verification');
          } else {
            navigate('/partner/dashboard');
          }
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      let errorMessage = error.message || (language === 'ru' ? "Произошла ошибка" : "Қате орын алды");
      
      // Handle specific error cases
      if (error.message?.includes('User already registered')) {
        errorMessage = language === 'ru' 
          ? "Пользователь с таким номером уже зарегистрирован. Попробуйте войти." 
          : "Бұл нөмірмен пайдаланушы тіркелген. Кіруге тырысыңыз.";
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = language === 'ru' 
          ? "Неверный номер телефона или пароль" 
          : "Телефон нөмірі немесе құпия сөз қате";
      } else if (error.message?.includes('Database error')) {
        errorMessage = language === 'ru' 
          ? "Ошибка базы данных. Попробуйте позже." 
          : "Деректер базасының қатесі. Кейінірек көріңіз.";
      }
      
      toast({
        title: language === 'ru' ? "Ошибка" : "Қате",
        description: errorMessage,
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
          {isRegisterMode ? t('register') : t('login')}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8">
          {t('enterPhone')}
        </p>

        {/* Phone Input */}
        <div className="mb-4">
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

        {/* Confirm Password Input (only in register mode) */}
        {isRegisterMode && (
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
        {!isRegisterMode && (
          <div className="mb-6 text-right">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-primary hover:underline"
            >
              {t('forgotPassword')}
            </button>
          </div>
        )}

        {/* Agreement Checkbox (only in register mode) */}
        {isRegisterMode && (
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
          disabled={loading || (isRegisterMode && !agreed)}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 mb-4"
        >
          {isRegisterMode ? t('register') : t('login')}
        </Button>

        {/* Toggle Mode Link */}
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
      </div>
    </div>
  );
};

export default PhoneAuth;
