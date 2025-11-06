import { useState } from "react";
import { Menu, User, RotateCcw, AlertTriangle, Clock, HeartPulse, Globe, Sun, Moon, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import carMainImage from "@/assets/car-main.png";
import logoImage from "@/assets/logo.png";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">{t('settings')}</h3>
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsThemeOpen(true);
                  }}
                >
                  {theme === 'dark' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                  <span>{t('appTheme')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/notification-settings');
                  }}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  <span>{t('notificationSettings')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLanguageOpen(true);
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{t('language')}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/about-app');
                  }}
                >
                  <Info className="h-4 w-4 mr-2" />
                  <span>{t('aboutApp')}</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>{t('support')}</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
              <User className="h-6 w-6 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">{t('profile')}</h3>
              <div className="space-y-4">
                <Button variant="ghost" className="w-full justify-start">
                  <span>{t('myCars')}</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>{t('serviceHistory')}</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>{t('profileSettings')}</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <span>{t('logout')}</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Car Display */}
      <div className="px-4 py-2">
        <div className="relative">
          <img 
            src={carMainImage} 
            alt="Toyota Camry 2019" 
            className="w-full h-64 object-cover rounded-lg"
          />
          {/* Interactive points */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
          </div>
          
          {/* 360 button */}
          <div className="absolute bottom-4 right-4">
            <Button size="sm" className="rounded-full bg-white/90 text-foreground hover:bg-white">
              <RotateCcw className="h-4 w-4 mr-1" />
              360°
            </Button>
          </div>
        </div>
      </div>

      {/* Car Info Cards */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-start space-x-2">
              <div className="text-muted-foreground">
                <span className="text-2xl">ⓘ</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Toyota Camry 2019</h3>
                <p className="text-sm text-muted-foreground">284 AVB 01</p>
                <div className="mt-2">
                  <p className="text-sm">{t('mileage')}</p>
                  <p className="font-semibold">143.450 км</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-2xl">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">29.07.2025</p>
                  <p className="text-xs text-muted-foreground">{t('oilChange')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">22.09.2025</p>
                  <p className="text-xs text-muted-foreground">{t('insuranceExpires')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Condition */}
        <Card className="p-4 bg-card rounded-2xl">
          <div className="flex items-center space-x-3">
            <HeartPulse className="h-6 w-6 text-app-green" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('technicalCondition')}</span>
                <span className="text-2xl font-bold text-app-green">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 pb-20">
          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">⚡</div>
              <div>
                <p className="text-xs text-muted-foreground">{t('avgConsumption')}</p>
                <p className="font-semibold">4.5 км/час</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card rounded-2xl">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">📋</div>
              <div>
                <p className="text-xs text-muted-foreground">{t('nextService')}</p>
                <p className="font-semibold">16.05.2025</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Language Selection Dialog */}
      <Dialog open={isLanguageOpen} onOpenChange={setIsLanguageOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">{t('selectLanguage')}</h3>
            <div className="space-y-2">
              <Button 
                variant={language === 'ru' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setLanguage('ru');
                  setIsLanguageOpen(false);
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                <span>{t('russian')}</span>
              </Button>
              <Button 
                variant={language === 'kk' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setLanguage('kk');
                  setIsLanguageOpen(false);
                }}
              >
                <Globe className="h-4 w-4 mr-2" />
                <span>{t('kazakh')}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Selection Dialog */}
      <Dialog open={isThemeOpen} onOpenChange={setIsThemeOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">{t('appTheme')}</h3>
            <div className="space-y-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setTheme('light');
                  setIsThemeOpen(false);
                }}
              >
                <Sun className="h-4 w-4 mr-2" />
                <span>{t('lightTheme')}</span>
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => {
                  setTheme('dark');
                  setIsThemeOpen(false);
                }}
              >
                <Moon className="h-4 w-4 mr-2" />
                <span>{t('darkTheme')}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;