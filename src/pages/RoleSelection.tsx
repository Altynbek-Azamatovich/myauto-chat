import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Wrench, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = async (role: 'user' | 'partner') => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/phone-auth');
        return;
      }

      // Check if user already has this role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('role', role)
        .single();

      // Add role if doesn't exist
      if (!existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: session.user.id, role });

        if (error) throw error;
      }

      // Navigate based on role
      if (role === 'partner') {
        navigate('/partner/dashboard');
      } else {
        // Check if profile setup is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate('/profile-setup');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      <Button
        variant="ghost"
        onClick={() => navigate('/welcome')}
        className="self-start mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('back')}
      </Button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
          {t('roleSelection.title')}
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          {t('roleSelection.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full">
          {/* User Role */}
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">{t('roleSelection.user.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('roleSelection.user.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li>✓ {t('roleSelection.user.feature1')}</li>
                <li>✓ {t('roleSelection.user.feature2')}</li>
                <li>✓ {t('roleSelection.user.feature3')}</li>
                <li>✓ {t('roleSelection.user.feature4')}</li>
              </ul>
              <Button
                onClick={() => handleRoleSelection('user')}
                disabled={loading}
                className="w-full"
              >
                {t('roleSelection.continueAsUser')}
              </Button>
            </CardContent>
          </Card>

          {/* Partner Role */}
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">{t('roleSelection.partner.title')}</CardTitle>
              <CardDescription className="text-center">
                {t('roleSelection.partner.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li>✓ {t('roleSelection.partner.feature1')}</li>
                <li>✓ {t('roleSelection.partner.feature2')}</li>
                <li>✓ {t('roleSelection.partner.feature3')}</li>
                <li>✓ {t('roleSelection.partner.feature4')}</li>
              </ul>
              <Button
                onClick={() => handleRoleSelection('partner')}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {t('roleSelection.continueAsPartner')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
