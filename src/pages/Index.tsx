import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/welcome');
        return;
      }

      // Check if user has partner role
      const { data: partnerRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'partner')
        .maybeSingle();

      if (partnerRole) {
        // Check verification status
        const { data: partnerData } = await supabase
          .from('service_partners')
          .select('is_verified')
          .eq('owner_id', session.user.id)
          .single();

        if (partnerData && !partnerData.is_verified) {
          navigate('/partner/pending-verification');
        } else {
          navigate('/partner/dashboard');
        }
        return;
      }

      // User role - check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!profile?.onboarding_completed) {
        navigate('/profile-setup');
      } else {
        navigate('/home');
      }
    };

    checkAuth();
  }, [navigate]);

  return null;
};

export default Index;
