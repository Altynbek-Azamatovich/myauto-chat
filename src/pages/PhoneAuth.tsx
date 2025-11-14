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
  const [partnerPin, setPartnerPin] = useState("");
  const [confirmPartnerPin, setConfirmPartnerPin] = useState("");
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

  const validatePin = (pin: string) => {
    if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return { valid: false, error: t('pinTooShort') };
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    const pendingRole = (localStorage.getItem('pending_role') || 'user') as 'user' | 'partner';
    
    if (!isPhoneValid(phone)) {
      toast({
        title: t('error'),
        description: t('invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      toast({
        title: t('error'),
        description: passwordValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        toast({
          title: t('error'),
          description: t('passwordsNotMatch'),
          variant: "destructive",
        });
        return;
      }

      // Валидация PIN для партнера
      if (pendingRole === 'partner') {
        const pinValidation = validatePin(partnerPin);
        if (!pinValidation.valid) {
          toast({
            title: t('error'),
            description: pinValidation.error,
            variant: "destructive",
          });
          return;
        }

        if (partnerPin !== confirmPartnerPin) {
          toast({
            title: t('error'),
            description: t('pinNotMatch'),
            variant: "destructive",
          });
          return;
        }
      }

      if (!agreed) {
        toast({
          title: t('error'),
          description: t('userAgreementRequired'),
          variant: "destructive",
        });
        return;
      }
    } else {
      // Проверка PIN при входе партнера
      if (pendingRole === 'partner') {
        const pinValidation = validatePin(partnerPin);
        if (!pinValidation.valid) {
          toast({
            title: t('error'),
            description: pinValidation.error,
            variant: "destructive",
          });
          return;
        }
      }
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const pendingRole = (localStorage.getItem('pending_role') || 'user') as 'user' | 'partner';
      const hashedPin = pendingRole === 'partner' && partnerPin ? btoa(partnerPin) : null;
      
      if (isRegisterMode) {
        // Try to create new user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          phone: cleanPhone,
          password: password,
        });

        // If user already exists, try to sign in and add role
        if (signUpError?.message?.includes('already') || signUpError?.message?.includes('registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            phone: cleanPhone,
            password: password,
          });

          if (signInError) {
            const roleNames = {
              user: language === 'ru' ? 'пользователя' : 'пайдаланушы',
              partner: language === 'ru' ? 'партнера' : 'серіктес'
            };
            
            throw new Error(
              language === 'ru' 
                ? `Этот номер уже зарегистрирован. Чтобы добавить роль ${roleNames[pendingRole as 'user' | 'partner']}, используйте ваш существующий пароль или войдите в систему.`
                : `Бұл нөмір тіркелген. ${roleNames[pendingRole as 'user' | 'partner']} рөлін қосу үшін қолданыстағы құпия сөзді пайдаланыңыз немесе жүйеге кіріңіз.`
            );
          }

          if (!signInData.user) throw new Error('Sign in failed');

          // Check if user already has this role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', signInData.user.id)
            .eq('role', pendingRole)
            .maybeSingle();

          if (existingRole) {
            const roleNames = {
              user: language === 'ru' ? 'пользователя' : 'пайдаланушының',
              partner: language === 'ru' ? 'партнера' : 'серіктестің'
            };
            
            throw new Error(
              t('accountAlreadyHasRole').replace('{role}', roleNames[pendingRole as 'user' | 'partner'])
            );
          }

          // Add the new role to existing user (only if it's not 'user' role, as trigger adds it automatically)
          if (pendingRole !== 'user') {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([{
                user_id: signInData.user.id,
                role: pendingRole as any
              }]);

            if (roleError) throw roleError;
          }

          // If partner, create service_partners entry (unverified) with PIN
          if (pendingRole === 'partner') {
            const { error: partnerError } = await supabase
              .from('service_partners')
              .insert([{
                owner_id: signInData.user.id,
                name: '',
                is_verified: false,
                partner_pin: hashedPin
              }]);

            if (partnerError) throw partnerError;
          }

          const roleNames = {
            user: language === 'ru' ? 'пользователя' : 'пайдаланушы',
            partner: language === 'ru' ? 'партнера' : 'серіктес'
          };

          toast({
            title: t('success'),
            description: t('roleAddedSuccess').replace('{role}', roleNames[pendingRole as 'user' | 'partner']),
          });
          
          localStorage.removeItem('pending_role');
          
          // Navigate based on role
          if (pendingRole === 'partner') {
            navigate('/partner/pending-verification');
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', signInData.user.id)
              .single();
            
            if (profile?.onboarding_completed) {
              navigate('/home');
            } else {
              navigate('/profile-setup');
            }
          }
          return;
        }

        // Handle other signup errors
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('Registration failed');

        // User was created successfully
        // Note: 'user' role is automatically added by trigger assign_user_role
        // Only add role if it's not 'user'
        if (pendingRole !== 'user') {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: authData.user.id,
              role: pendingRole as any
            }]);

          if (roleError) throw roleError;
        }

          // If partner, create service_partners entry (unverified) with PIN
          if (pendingRole === 'partner') {
            const { error: partnerError } = await supabase
              .from('service_partners')
              .insert([{
                owner_id: authData.user.id,
                name: '',
                is_verified: false,
                partner_pin: hashedPin
              }]);

            if (partnerError) throw partnerError;
          }

        toast({
          title: t('success'),
          description: t('registrationComplete'),
        });
        
        localStorage.removeItem('pending_role');
        
        // Navigate based on role
        if (pendingRole === 'partner') {
          navigate('/partner/pending-verification');
        } else {
          navigate('/profile-setup');
        }
      } else {
        // Login - check if user has the selected role
        const { data, error } = await supabase.auth.signInWithPassword({
          phone: cleanPhone,
          password: password,
        });

        if (error) throw error;

        // Для партнера проверяем PIN
        if (pendingRole === 'partner') {
          const { data: partnerData, error: partnerError } = await supabase
            .from('service_partners')
            .select('partner_pin')
            .eq('owner_id', data.user.id)
            .maybeSingle();

          if (!partnerError && partnerData) {
            // @ts-ignore - partner_pin добавлена в миграции
            const storedPin = partnerData.partner_pin;
            if (storedPin && storedPin !== hashedPin) {
              await supabase.auth.signOut();
              throw new Error(t('pinInvalid'));
            }
          }
        }

        // Check if the user has the selected role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', pendingRole)
          .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
          // User doesn't have this role - add it automatically
          const { error: addRoleError } = await supabase
            .from('user_roles')
            .insert([{
              user_id: data.user.id,
              role: pendingRole as any
            }]);

          if (addRoleError) {
            await supabase.auth.signOut();
            throw addRoleError;
          }

          // If adding partner role, create service_partners entry with PIN
          if (pendingRole === 'partner') {
            const { error: partnerError } = await supabase
              .from('service_partners')
              .insert([{
                owner_id: data.user.id,
                name: '',
                is_verified: false,
                partner_pin: hashedPin
              }]);

            if (partnerError && !partnerError.message?.includes('duplicate')) {
              await supabase.auth.signOut();
              throw partnerError;
            }
          }

          const roleNames = {
            user: language === 'ru' ? 'пользователя' : 'пайдаланушы',
            partner: language === 'ru' ? 'партнера' : 'серіктес'
          };

          toast({
            title: t('roleAdded'),
            description: t('roleAddedToAccount').replace('{role}', roleNames[pendingRole as 'user' | 'partner']),
          });
        }

        toast({
          title: t('success'),
          description: t('loginComplete'),
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

        {/* Partner PIN Input */}
        {(localStorage.getItem('pending_role') === 'partner') && (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={partnerPin}
                  onChange={(e) => setPartnerPin(e.target.value.replace(/\D/g, ''))}
                  placeholder={isRegisterMode ? t('createPartnerPin') : t('enterPartnerPin')}
                  className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
              </div>
            </div>

            {/* Confirm Partner PIN (only in register mode) */}
            {isRegisterMode && (
              <div className="mb-4">
                <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPartnerPin}
                    onChange={(e) => setConfirmPartnerPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('confirmPartnerPin')}
                    className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                  />
                </div>
              </div>
            )}
          </>
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
              setPartnerPin("");
              setConfirmPartnerPin("");
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
