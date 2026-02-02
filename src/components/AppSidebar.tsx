import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, History, UserCog, LogOut, Sun, Moon, Bell, Info, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    avatar_url: string | null;
  } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone_number, avatar_url')
      .eq('id', user.id)
      .single();

    if (data) {
      setUserProfile(data as any);
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

  const menuItems = [
    { icon: Car, label: t('myVehicles'), path: '/my-vehicles' },
    { icon: History, label: t('serviceHistoryTitle'), path: '/service-history' },
    { icon: UserCog, label: t('profileSettingsTitle'), path: '/profile-settings' },
  ];

  const settingsItems = [
    { icon: Bell, label: t('notificationSettings'), path: '/notification-settings' },
    { icon: Info, label: t('aboutApp'), path: '/about-app' },
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 border-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col min-h-full">
              {/* User Profile Header */}
              <div className="p-5 pb-4">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleNavigation('/profile-settings')}
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={userProfile?.avatar_url || ''} alt="Avatar" />
                    <AvatarFallback className="bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {userProfile?.first_name || userProfile?.last_name ? (
                      <p className="font-semibold text-base truncate">
                        {userProfile.first_name} {userProfile.last_name}
                      </p>
                    ) : (
                      <p className="font-semibold text-base">{t('profileTitle')}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile?.phone_number}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-3 space-y-0.5">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings Items */}
              <div className="px-3 mt-4 space-y-0.5">
                {settingsItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Theme & Language */}
              <div className="px-3 mt-6 space-y-4">
                {/* Theme Toggle */}
                <div className="px-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t('appTheme')}</p>
                  <div className="flex gap-1.5">
                    <Button
                      variant={theme === 'light' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-3.5 w-3.5 mr-1.5" />
                      {t('lightTheme')}
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-3.5 w-3.5 mr-1.5" />
                      {t('darkTheme')}
                    </Button>
                  </div>
                </div>

                {/* Language Toggle */}
                <div className="px-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t('language')}</p>
                  <div className="flex gap-1.5">
                    <Button
                      variant={language === 'kk' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => setLanguage('kk')}
                    >
                      ҚАЗ
                    </Button>
                    <Button
                      variant={language === 'ru' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => setLanguage('ru')}
                    >
                      РУС
                    </Button>
                    <Button
                      variant={language === 'en' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs"
                      onClick={() => setLanguage('en')}
                    >
                      ENG
                    </Button>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="mt-auto p-3 pt-8">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2} />
                  <span className="text-sm font-medium">{t('logoutTitle')}</span>
                </button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('logoutConfirmation')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="rounded-xl">{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
