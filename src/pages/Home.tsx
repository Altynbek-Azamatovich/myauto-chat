import { useState, useEffect } from "react";
import { Menu, User, RotateCcw, AlertTriangle, Clock, HeartPulse, Globe, Sun, Moon, Bell, Info, Car, History, UserCog, LogOut, CalendarIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import carCoveredImage from "@/assets/car-covered-new.png";
import logoImage from "@/assets/logo-new.png";
import BottomNavigation from '@/components/BottomNavigation';

interface Vehicle {
  id: string;
  brand_id: string;
  model: string;
  year: number;
  license_plate?: string;
  mileage: number;
  is_primary: boolean;
  oil_change_date?: string;
  insurance_expiry_date?: string;
  technical_condition?: number;
  average_consumption?: number;
  next_service_date?: string;
}

interface CarBrand {
  id: string;
  brand_name: string;
}

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isOilChangeDateOpen, setIsOilChangeDateOpen] = useState(false);
  const [isInsuranceDateOpen, setIsInsuranceDateOpen] = useState(false);
  const [isNextServiceDateOpen, setIsNextServiceDateOpen] = useState(false);
  const [isPartSelectOpen, setIsPartSelectOpen] = useState(false);
  const [oilChangeDate, setOilChangeDate] = useState<Date>();
  const [insuranceDate, setInsuranceDate] = useState<Date>();
  const [nextServiceDate, setNextServiceDate] = useState<Date>();
  const [primaryVehicle, setPrimaryVehicle] = useState<Vehicle | null>(null);
  const [brandName, setBrandName] = useState<string>('');
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/phone-auth');
      return;
    }
    fetchPrimaryVehicle();
  };

  const fetchPrimaryVehicle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: vehicles } = await supabase
      .from('user_vehicles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .limit(1);

    if (vehicles && vehicles.length > 0) {
      const vehicle = vehicles[0];
      setPrimaryVehicle(vehicle);

      // Set dates if they exist
      if (vehicle.oil_change_date) {
        setOilChangeDate(new Date(vehicle.oil_change_date));
      }
      if (vehicle.insurance_expiry_date) {
        setInsuranceDate(new Date(vehicle.insurance_expiry_date));
      }
      if (vehicle.next_service_date) {
        setNextServiceDate(new Date(vehicle.next_service_date));
      }

      // Fetch brand name
      const { data: brand } = await supabase
        .from('car_brands')
        .select('brand_name')
        .eq('id', vehicle.brand_id)
        .single();

      if (brand) {
        setBrandName(brand.brand_name);
      }
    }
  };

  const updateVehicleDate = async (field: string, date: Date | undefined) => {
    if (!primaryVehicle || !date) return;

    const { error } = await supabase
      .from('user_vehicles')
      .update({ [field]: format(date, 'yyyy-MM-dd') })
      .eq('id', primaryVehicle.id);

    if (error) {
      toast.error(t('errorUpdating'));
    } else {
      toast.success(t('successUpdated'));
      fetchPrimaryVehicle();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/phone-auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-6 w-6" />
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

        <img src={logoImage} alt="myAuto" className="h-10 w-auto" />

        <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <User className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">{t('profileTitle')}</h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/my-vehicles');
                  }}
                >
                  <Car className="mr-2 h-5 w-5" />
                  {t('myVehicles')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/service-history');
                  }}
                >
                  <History className="mr-2 h-5 w-5" />
                  {t('serviceHistoryTitle')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/profile-settings');
                  }}
                >
                  <UserCog className="mr-2 h-5 w-5" />
                  {t('profileSettingsTitle')}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  {t('logoutTitle')}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Car Display */}
      <div className="px-4 py-2">
        <div className="relative">
          <img 
            src={carCoveredImage} 
            alt="Toyota Camry 2019" 
            className="w-full h-64 object-cover rounded-lg"
          />
          {/* Interactive points */}
          <button 
            onClick={() => setIsPartSelectOpen(true)}
            className="absolute top-1/4 left-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
          </button>
          <button 
            onClick={() => setIsPartSelectOpen(true)}
            className="absolute top-1/3 right-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
          </button>
          <button 
            onClick={() => setIsPartSelectOpen(true)}
            className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
          </button>
          <button 
            onClick={() => setIsPartSelectOpen(true)}
            className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          >
            <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
          </button>
          
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
          <Card className="p-4 bg-muted/90 backdrop-blur-sm rounded-2xl border-border/30">
            <div className="flex items-start space-x-3">
              <div className="text-muted-foreground mt-0.5">
                <span className="text-xl">ⓘ</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight mb-1">
                  {primaryVehicle ? (
                    `${brandName} ${primaryVehicle.model} ${primaryVehicle.year}`
                  ) : (
                    <button 
                      onClick={() => navigate('/my-vehicles')}
                      className="text-primary hover:underline text-left"
                    >
                      {t('addYourCar')}
                    </button>
                  )}
                </h3>
                {primaryVehicle?.license_plate && (
                  <p className="text-sm text-muted-foreground mb-3">{primaryVehicle.license_plate}</p>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">{t('mileage')}</p>
                  <p className="font-semibold text-sm">
                    {primaryVehicle ? primaryVehicle.mileage.toLocaleString() : '0'} км
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/90 backdrop-blur-sm rounded-2xl border-border/30">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Popover open={isOilChangeDateOpen} onOpenChange={setIsOilChangeDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                        <div className="text-left">
                          <p className="text-sm font-medium leading-tight flex items-center gap-1">
                            {oilChangeDate ? format(oilChangeDate, 'dd.MM.yyyy') : '—'}
                            <Edit className="h-3 w-3 text-muted-foreground" />
                          </p>
                          <p className="text-xs text-muted-foreground">{t('oilChange')}</p>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={oilChangeDate}
                        onSelect={(date) => {
                          setOilChangeDate(date);
                          if (date) {
                            updateVehicleDate('oil_change_date', date);
                            setIsOilChangeDateOpen(false);
                          }
                        }}
                        initialFocus
                        locale={language === 'ru' ? ru : kk}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Popover open={isInsuranceDateOpen} onOpenChange={setIsInsuranceDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                        <div className="text-left">
                          <p className="text-sm font-medium leading-tight flex items-center gap-1">
                            {insuranceDate ? format(insuranceDate, 'dd.MM.yyyy') : '—'}
                            <Edit className="h-3 w-3 text-muted-foreground" />
                          </p>
                          <p className="text-xs text-muted-foreground">{t('insuranceExpires')}</p>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={insuranceDate}
                        onSelect={(date) => {
                          setInsuranceDate(date);
                          if (date) {
                            updateVehicleDate('insurance_expiry_date', date);
                            setIsInsuranceDateOpen(false);
                          }
                        }}
                        initialFocus
                        locale={language === 'ru' ? ru : kk}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Technical Condition */}
        <Card className="p-4 bg-muted/90 backdrop-blur-sm rounded-2xl border-border/30">
          <div className="flex items-center space-x-3">
            <HeartPulse className="h-5 w-5 text-app-green flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('technicalCondition')}</span>
                <span className="text-xl font-bold text-app-green">
                  {primaryVehicle?.technical_condition || 0}%
                </span>
              </div>
              <Progress value={primaryVehicle?.technical_condition || 0} className="h-2 [&>div]:bg-app-green" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
              {(!primaryVehicle?.technical_condition || primaryVehicle.technical_condition === 0) && (
                <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  Актуальное состояние будет после прохождения ТО
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 pb-24">
          <Card className="p-4 bg-muted/90 backdrop-blur-sm rounded-2xl border-border/30">
            <div className="flex items-start space-x-2">
              <div className="text-xl mt-0.5">⚡</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t('avgConsumption')}</p>
                {primaryVehicle?.average_consumption ? (
                  <p className="font-semibold text-sm">{primaryVehicle.average_consumption} л/100км</p>
                ) : (
                  <p className="text-xs text-yellow-500 mt-1">Будет доступно после ТО</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-muted/90 backdrop-blur-sm rounded-2xl border-border/30">
            <div className="flex items-start space-x-2">
              <div className="text-xl mt-0.5">📋</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{t('nextService')}</p>
                <Popover open={isNextServiceDateOpen} onOpenChange={setIsNextServiceDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      <div className="text-left">
                        <p className="font-semibold text-sm flex items-center gap-1">
                          {nextServiceDate ? format(nextServiceDate, 'dd.MM.yyyy') : '—'}
                          <Edit className="h-3 w-3 text-muted-foreground" />
                        </p>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={nextServiceDate}
                      onSelect={(date) => {
                        setNextServiceDate(date);
                        if (date) {
                          updateVehicleDate('next_service_date', date);
                          setIsNextServiceDateOpen(false);
                        }
                      }}
                      initialFocus
                      locale={language === 'ru' ? ru : kk}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
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

      <AlertDialog open={isPartSelectOpen} onOpenChange={setIsPartSelectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выбор деталей авто</AlertDialogTitle>
            <AlertDialogDescription>
              Функция выбора деталей автомобиля пока находится в разработке и будет доступна в ближайшее время.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsPartSelectOpen(false)}>Понятно</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('logoutTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('logoutConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>{t('confirmLogout')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNavigation />
    </div>
  );
};

export default Home;