import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthenticated(!!session);
        
        if (requireAuth && !session) {
          navigate('/phone-auth', { replace: true });
        } else if (!requireAuth && session) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (requireAuth) {
          navigate('/phone-auth', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
      
      if (requireAuth && !session) {
        navigate('/phone-auth', { replace: true });
      } else if (!requireAuth && session) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requireAuth && !authenticated) {
    return null;
  }

  if (!requireAuth && authenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
