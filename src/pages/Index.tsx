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

      // Check user role from metadata
      const userRole = session.user?.user_metadata?.role || 'user';
      
      if (userRole === 'partner') {
        navigate('/partner/dashboard');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

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
