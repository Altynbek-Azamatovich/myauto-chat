import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleResetPassword = async () => {
    if (!isPhoneValid(phone)) {
      toast({
        title: t('error'),
        description: t('invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        `${phone.replace(/\D/g, '')}@myauto.app`,
        {
          redirectTo: `${window.location.origin}/phone-auth`,
        }
      );

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('passwordResetSent'),
      });

      navigate('/phone-auth');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: t('error'),
        description: error.message || t('passwordResetError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {t('forgotPassword')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {t('forgotPasswordDescription')}
          </p>
        </div>

        {/* Phone Input */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 XXX XXX XXXX"
              className="h-14 text-lg pl-4 bg-card"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleResetPassword}
          disabled={isLoading}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90"
        >
          {isLoading ? t('loading') : t('resetPassword')}
        </Button>
      </div>
    </div>
  );
};

export default ForgotPassword;
