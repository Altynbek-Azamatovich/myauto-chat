import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, History, LogOut, Sun, Moon, Bell, Info, User, ChevronRight } from 'lucide-react';
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
  ];

  const settingsItems = [
    { icon: Bell, label: t('notificationSettings'), path: '/notification-settings' },
    { icon: Info, label: t('aboutApp'), path: '/about-app' },
  ];

  // Calculate dynamic font size for name
  const getNameFontSize = () => {
    const firstName = userProfile?.first_name || '';
    const lastName = userProfile?.last_name || '';
    const fullLength = firstName.length + lastName.length + 1;
    
    if (fullLength > 20) return 'text-sm';
    if (fullLength > 15) return 'text-base';
    return 'text-lg';
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-0" hideCloseButton>
          <ScrollArea className="h-full">
            <div className="flex flex-col min-h-full py-6">
              {/* User Profile Header */}
              <div className="px-5 pb-6">
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
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {userProfile?.first_name || userProfile?.last_name ? (
                      <p className={`font-semibold truncate ${getNameFontSize()}`}>
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
              <div className="px-3 space-y-0.5 mt-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Settings Section */}
              <div className="px-3 mt-4 space-y-0.5">
                {settingsItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Theme & Language */}
              <div className="px-3 mt-6">
                {/* Theme Toggle */}
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('appTheme')}</p>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-3.5 w-3.5 mr-1.5" />
                      {t('lightTheme')}
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-3.5 w-3.5 mr-1.5" />
                      {t('darkTheme')}
                    </Button>
                  </div>
                </div>

                {/* Language Toggle */}
                <div className="px-3 py-2 mt-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('language')}</p>
                  <div className="flex gap-1.5">
                    <Button
                      variant={language === 'kk' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs px-2"
                      onClick={() => setLanguage('kk')}
                    >
                      ҚАЗ
                    </Button>
                    <Button
                      variant={language === 'ru' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs px-2"
                      onClick={() => setLanguage('ru')}
                    >
                      РУС
                    </Button>
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs px-2"
                      onClick={() => setLanguage('en')}
                    >
                      ENG
                    </Button>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <div className="mt-auto px-3 pt-8">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                  <span className="text-sm font-medium">{t('logoutTitle')}</span>
                </button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[90%] w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t('logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">{t('logoutConfirmation')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl m-0">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="flex-1 rounded-xl m-0">{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
