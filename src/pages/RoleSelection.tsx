import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen bg-background flex flex-col p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/welcome')}
        className="self-start mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        {t('back')}
      </Button>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-foreground mb-12 text-center">
          {t('roleSelectionTitle')}
        </h1>

        <div className="flex gap-6 w-full justify-center items-stretch">
          {/* User Role - Автовладелец */}
          <Card 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary group flex-1 max-w-xs"
            onClick={() => !loading && handleRoleSelection('user')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  {t('carOwner')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('carOwnerDesc')}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('user');
                }}
                disabled={loading}
                className="w-full"
              >
                {t('continueAsUser')}
              </Button>
            </div>
          </Card>

          {/* Partner Role - Партнер Автосервис */}
          <Card 
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary group flex-1 max-w-xs"
            onClick={() => !loading && handleRoleSelection('partner')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  {t('partner')}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t('partnerDesc')}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('partner');
                }}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {t('continueAsPartner')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
