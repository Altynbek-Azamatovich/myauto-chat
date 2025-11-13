import { useState, useEffect } from "react";
import { Menu, Bell, RotateCcw, AlertTriangle, Clock, HeartPulse, CalendarIcon, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import carCoveredImage from "@/assets/car-covered.svg";
import logoImage from "@/assets/logo.svg";
import BottomNavigation from '@/components/BottomNavigation';
import { AppSidebar } from '@/components/AppSidebar';

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
  const [isOilChangeDateOpen, setIsOilChangeDateOpen] = useState(false);
  const [isInsuranceDateOpen, setIsInsuranceDateOpen] = useState(false);
  const [isNextServiceDateOpen, setIsNextServiceDateOpen] = useState(false);
  const [oilChangeDate, setOilChangeDate] = useState<Date>();
  const [insuranceDate, setInsuranceDate] = useState<Date>();
  const [nextServiceDate, setNextServiceDate] = useState<Date>();
  const [primaryVehicle, setPrimaryVehicle] = useState<Vehicle | null>(null);
  const [brandName, setBrandName] = useState<string>('');
  const { t, language } = useLanguage();

  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/welcome');
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <AppSidebar 
          trigger={
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/30 hover:text-foreground">
              <Menu className="h-8 w-8" />
            </Button>
          }
        />

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-8 w-8" />
        </Button>
      </header>

      {/* Car Display */}
      <div className="py-2 relative">
        <img 
          src={carCoveredImage} 
          alt="Toyota Camry 2019" 
          className="w-full h-auto object-contain max-h-[60vh]"
        />
        
        {/* Interactive Points */}
        <button 
          onClick={() => toast.info('Выбор деталей в разработке')}
          className="absolute top-[25%] left-[30%] w-6 h-6 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
        </button>
        
        <button 
          onClick={() => toast.info('Выбор деталей в разработке')}
          className="absolute top-[30%] right-[25%] w-6 h-6 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
        </button>
        
        <button 
          onClick={() => toast.info('Выбор деталей в разработке')}
          className="absolute top-[50%] left-[20%] w-6 h-6 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
        </button>
        
        <button 
          onClick={() => toast.info('Выбор деталей в разработке')}
          className="absolute top-[55%] right-[30%] w-6 h-6 rounded-full border-2 border-white bg-white/20 backdrop-blur-sm hover:scale-110 transition-transform"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
        </button>

        {/* 360 Button */}
        <Button
          onClick={() => toast.info('3D модели авто в разработке')}
          className="absolute bottom-4 right-4 px-6 py-3 rounded-full bg-black/35 backdrop-blur-md border-white/20 hover:bg-black/45 text-white font-semibold flex items-center gap-2"
        >
          <RotateCcw size={18} />
          360
        </Button>
      </div>

      {/* Car Info Cards */}
      <div className="px-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border-white/20">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="text-white">
                <span className="text-xl">ⓘ</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight text-white">
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
                  <p className="text-sm text-white/70 mt-1">{primaryVehicle.license_plate}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/70">{t('mileage')}</p>
              <p className="font-semibold text-sm text-white">
                {primaryVehicle ? primaryVehicle.mileage.toLocaleString() : '0'} км
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border-white/20">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">{t('oilChange')}</p>
                <Popover open={isOilChangeDateOpen} onOpenChange={setIsOilChangeDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      <div className="text-left">
                        <p className="text-sm font-medium leading-tight flex items-center gap-1 text-white">
                          {oilChangeDate ? format(oilChangeDate, 'dd.MM.yyyy') : '—'}
                          <Edit className="h-3 w-3 text-white/70" />
                        </p>
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
              <Clock className="h-5 w-5 text-white flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">{t('insuranceExpires')}</p>
                <Popover open={isInsuranceDateOpen} onOpenChange={setIsInsuranceDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      <div className="text-left">
                        <p className="text-sm font-medium leading-tight flex items-center gap-1 text-white">
                          {insuranceDate ? format(insuranceDate, 'dd.MM.yyyy') : '—'}
                          <Edit className="h-3 w-3 text-white/70" />
                        </p>
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
      <Card className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border-white/20">
        <div className="flex items-center space-x-3">
            <HeartPulse className="h-5 w-5 text-app-green flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{t('technicalCondition')}</span>
                <span className="text-xl font-bold text-app-green">
                  {primaryVehicle?.technical_condition || 0}%
                </span>
              </div>
              <Progress value={primaryVehicle?.technical_condition || 0} className="h-2 [&>div]:bg-app-green" />
              <div className="flex justify-between text-xs text-white/70 mt-1">
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
        <Card className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border-white/20">
          <div className="flex items-start space-x-2">
              <div className="text-xl mt-0.5">⚡</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">{t('avgConsumption')}</p>
                {primaryVehicle?.average_consumption ? (
                  <p className="font-semibold text-sm text-white">{primaryVehicle.average_consumption} л/100км</p>
                ) : (
                  <p className="text-xs text-yellow-500 mt-1">Будет доступно после ТО</p>
                )}
              </div>
            </div>
          </Card>

        <Card className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border-white/20">
          <div className="flex items-start space-x-2">
              <div className="text-xl mt-0.5">📋</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">{t('nextService')}</p>
                <Popover open={isNextServiceDateOpen} onOpenChange={setIsNextServiceDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      <div className="text-left">
                        <p className="font-semibold text-sm flex items-center gap-1 text-white">
                          {nextServiceDate ? format(nextServiceDate, 'dd.MM.yyyy') : '—'}
                          <Edit className="h-3 w-3 text-white/70" />
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

      <BottomNavigation />
    </div>
  );
};

export default Home;