import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, History, UserCog, LogOut, Globe, Sun, Moon, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface AppSidebarProps {
  trigger: React.ReactNode;
}

export function AppSidebar({ trigger }: AppSidebarProps) {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    last_name: string;
    phone_number: string;
  } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number')
      .eq('id', user.id)
      .single();

    if (data) {
      setUserProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="left" className="w-80 pt-6">
          {/* User Profile Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCog className="h-6 w-6 text-primary" />
              </div>
              <div>
                {userProfile?.first_name || userProfile?.last_name ? (
                  <p className="font-semibold text-base">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                ) : (
                  <p className="font-semibold text-base">{t('profileTitle')}</p>
                )}
                <p className="text-sm text-muted-foreground">{userProfile?.phone_number}</p>
              </div>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Main Actions */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2">{t('main')}</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/my-vehicles')}
              >
                <Car className="mr-3 h-5 w-5" />
                {t('myVehicles')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/service-history')}
              >
                <History className="mr-3 h-5 w-5" />
                {t('serviceHistoryTitle')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/profile-settings')}
              >
                <UserCog className="mr-3 h-5 w-5" />
                {t('profileSettingsTitle')}
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2">{t('settings')}</h3>
            <div className="space-y-3">
              {/* Theme Toggle */}
              <div className="px-2">
                <p className="text-sm font-medium mb-2">{t('appTheme')}</p>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    {language === 'kk' ? 'Ашық' : 'Светлая'}
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    {language === 'kk' ? 'Қараңғы' : 'Темная'}
                  </Button>
                </div>
              </div>

              {/* Language Toggle */}
              <div className="px-2">
                <p className="text-sm font-medium mb-2">{t('language')}</p>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'kk' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => setLanguage('kk')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Қазақша
                  </Button>
                  <Button
                    variant={language === 'ru' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={() => setLanguage('ru')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Русский
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/notification-settings')}
              >
                <Bell className="mr-3 h-5 w-5" />
                {t('notificationSettings')}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation('/about-app')}
              >
                <Info className="mr-3 h-5 w-5" />
                {t('aboutApp')}
              </Button>
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              setIsOpen(false);
              setIsLogoutDialogOpen(true);
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {t('logoutTitle')}
          </Button>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('logoutConfirmation')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
