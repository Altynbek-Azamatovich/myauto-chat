import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Phone, Clock, Calendar as CalendarIcon, User, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/hooks/usePersistedState";

interface ServicePartner {
  id: string;
  name: string;
  address: string;
  city: string;
  phone_number: string;
  rating: number;
  working_hours: any;
}

interface Master {
  id: string;
  full_name: string;
  specialization: string;
  experience_years: number;
}

interface Vehicle {
  id: string;
  brand_id: string;
  model: string;
  year: number;
  car_brands: {
    brand_name: string;
  };
}

const SERVICE_TYPES = [
  { value: "maintenance", labelRu: "Техническое обслуживание", labelKk: "Техникалық қызмет көрсету" },
  { value: "repair", labelRu: "Ремонт", labelKk: "Жөндеу" },
  { value: "diagnostics", labelRu: "Диагностика", labelKk: "Диагностика" },
  { value: "tire_service", labelRu: "Шиномонтаж", labelKk: "Шина монтажы" },
  { value: "body_work", labelRu: "Кузовной ремонт", labelKk: "Кузов жөндеу" },
  { value: "painting", labelRu: "Покраска", labelKk: "Бояу" },
  { value: "detailing", labelRu: "Детейлинг", labelKk: "Детейлинг" },
  { value: "oil_change", labelRu: "Замена масла", labelKk: "Май ауыстыру" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
];

const ServiceBooking = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [step, setStep] = useState<'partner' | 'details'>('partner');
  const [partners, setPartners] = useState<ServicePartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<ServicePartner | null>(null);
  const [masters, setMasters] = useState<Master[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state with persistence
  const [vehicleId, setVehicleId] = usePersistedState("booking_vehicle_id", "");
  const [masterId, setMasterId] = usePersistedState("booking_master_id", "");
  const [serviceType, setServiceType] = usePersistedState("booking_service_type", "");
  const [description, setDescription] = usePersistedState("booking_description", "");
  const [selectedDate, setSelectedDate] = usePersistedState<Date | undefined>("booking_selected_date", undefined);
  const [selectedTime, setSelectedTime] = usePersistedState("booking_selected_time", "");

  useEffect(() => {
    fetchPartners();
    fetchVehicles();
  }, []);

  const fetchPartners = async () => {
    const { data, error } = await supabase
      .from("service_partners")
      .select("*")
      .eq("is_verified", true)
      .order("rating", { ascending: false });

    if (error) {
      toast.error(t("failedToLoadPartners"));
      return;
    }

    setPartners(data || []);
  };

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_vehicles")
      .select(`
        *,
        car_brands (brand_name)
      `)
      .eq("user_id", user.id);

    if (error) {
      toast.error(t("failedToLoadVehicles"));
      return;
    }

    setVehicles(data || []);
  };

  const fetchMasters = async (partnerId: string) => {
    const { data, error } = await supabase
      .from("masters")
      .select("*")
      .eq("partner_id", partnerId)
      .eq("is_active", true);

    if (error) {
      toast.error(t("failedToLoadMasters"));
      return;
    }

    setMasters(data || []);
  };

  const handlePartnerSelect = (partner: ServicePartner) => {
    setSelectedPartner(partner);
    fetchMasters(partner.id);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedPartner || !vehicleId || !serviceType || !description || !selectedDate || !selectedTime) {
      toast.error(language === 'ru' ? "Заполните все поля" : "Барлық өрістерді толтырыңыз");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error(t("notAuthenticated"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("service_requests").insert([{
      user_id: user.id,
      vehicle_id: vehicleId,
      partner_id: selectedPartner.id,
      service_type: serviceType as any,
      description: description,
      preferred_date: format(selectedDate, "yyyy-MM-dd"),
      preferred_time: selectedTime,
      status: "pending"
    }]);

    setLoading(false);

    if (error) {
      toast.error(t('requestCreateError'));
      return;
    }

    toast.success(t('requestSuccess'));
    navigate("/services");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 'details' ? setStep('partner') : navigate("/services")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">
            {language === 'ru' ? 'Запись на обслуживание' : 'Қызметке жазылу'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {step === 'partner' ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              {language === 'ru' ? 'Выберите автосервис' : 'Автосервисті таңдаңыз'}
            </h2>
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handlePartnerSelect(partner)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{partner.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{partner.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{partner.address}, {partner.city}</span>
                  </div>

                  {partner.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{partner.phone_number}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">{selectedPartner?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPartner?.address}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div>
                <Label>{language === 'ru' ? 'Автомобиль' : 'Автомобиль'}</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ru' ? 'Выберите автомобиль' : 'Автомобильді таңдаңыз'} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.car_brands.brand_name} {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {masters.length > 0 && (
                <div>
                  <Label>{language === 'ru' ? 'Мастер (необязательно)' : 'Шебер (міндетті емес)'}</Label>
                  <Select value={masterId} onValueChange={setMasterId}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ru' ? 'Выберите мастера' : 'Шеберді таңдаңыз'} />
                    </SelectTrigger>
                    <SelectContent>
                      {masters.map((master) => (
                        <SelectItem key={master.id} value={master.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{master.full_name}</span>
                            {master.specialization && (
                              <span className="text-xs text-muted-foreground">
                                ({master.specialization})
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>{language === 'ru' ? 'Тип работ' : 'Жұмыс түрі'}</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ru' ? 'Выберите тип работ' : 'Жұмыс түрін таңдаңыз'} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {language === 'ru' ? type.labelRu : type.labelKk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'ru' ? 'Дата' : 'Күні'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : 
                        (language === 'ru' ? 'Выберите дату' : 'Күнді таңдаңыз')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{language === 'ru' ? 'Время' : 'Уақыты'}</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'ru' ? 'Выберите время' : 'Уақытты таңдаңыз'} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'ru' ? 'Описание проблемы' : 'Мәселенің сипаттамасы'}</Label>
                <Textarea
                  placeholder={language === 'ru' ? 
                    'Опишите, что нужно сделать...' : 
                    'Не істеу керектігін сипаттаңыз...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={loading}
              >
                {loading ? 
                  (language === 'ru' ? 'Отправка...' : 'Жіберілуде...') :
                  (language === 'ru' ? 'Отправить заявку' : 'Өтінімді жіберу')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceBooking;
