import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Phone, Clock, Calendar as CalendarIcon, User, Wrench, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/hooks/usePersistedState";
import { ServiceUnderDevelopment } from "@/components/ServiceUnderDevelopment";

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
  { value: "maintenance", label: { ru: "Техническое обслуживание", kk: "Техникалық қызмет көрсету", en: "Maintenance" } },
  { value: "repair", label: { ru: "Ремонт", kk: "Жөндеу", en: "Repair" } },
  { value: "diagnostics", label: { ru: "Диагностика", kk: "Диагностика", en: "Diagnostics" } },
  { value: "tire_service", label: { ru: "Шиномонтаж", kk: "Шина монтажы", en: "Tire Service" } },
  { value: "body_work", label: { ru: "Кузовной ремонт", kk: "Кузов жөндеу", en: "Body Work" } },
  { value: "painting", label: { ru: "Покраска", kk: "Бояу", en: "Painting" } },
  { value: "detailing", label: { ru: "Детейлинг", kk: "Детейлинг", en: "Detailing" } },
  { value: "oil_change", label: { ru: "Замена масла", kk: "Май ауыстыру", en: "Oil Change" } },
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

  const [vehicleId, setVehicleId] = usePersistedState("booking_vehicle_id", "");
  const [masterId, setMasterId] = usePersistedState("booking_master_id", "");
  const [serviceType, setServiceType] = usePersistedState("booking_service_type", "");
  const [description, setDescription] = usePersistedState("booking_description", "");
  const [selectedDate, setSelectedDate] = usePersistedState<Date | undefined>("booking_selected_date", undefined);
  const [selectedTime, setSelectedTime] = usePersistedState("booking_selected_time", "");

  const labels = {
    title: { ru: 'Запись на обслуживание', kk: 'Қызметке жазылу', en: 'Book Service' },
    selectService: { ru: 'Выберите автосервис', kk: 'Автосервисті таңдаңыз', en: 'Select Service Center' },
    vehicle: { ru: 'Автомобиль', kk: 'Автомобиль', en: 'Vehicle' },
    selectVehicle: { ru: 'Выберите автомобиль', kk: 'Автомобильді таңдаңыз', en: 'Select vehicle' },
    master: { ru: 'Мастер', kk: 'Шебер', en: 'Master' },
    optional: { ru: 'необязательно', kk: 'міндетті емес', en: 'optional' },
    selectMaster: { ru: 'Выберите мастера', kk: 'Шеберді таңдаңыз', en: 'Select master' },
    workType: { ru: 'Тип работ', kk: 'Жұмыс түрі', en: 'Work Type' },
    selectWorkType: { ru: 'Выберите тип работ', kk: 'Жұмыс түрін таңдаңыз', en: 'Select work type' },
    date: { ru: 'Дата', kk: 'Күні', en: 'Date' },
    selectDate: { ru: 'Выберите дату', kk: 'Күнді таңдаңыз', en: 'Select date' },
    time: { ru: 'Время', kk: 'Уақыты', en: 'Time' },
    selectTime: { ru: 'Выберите время', kk: 'Уақытты таңдаңыз', en: 'Select time' },
    description: { ru: 'Описание проблемы', kk: 'Мәселенің сипаттамасы', en: 'Problem Description' },
    descriptionPlaceholder: { ru: 'Опишите, что нужно сделать...', kk: 'Не істеу керектігін сипаттаңыз...', en: 'Describe what needs to be done...' },
    submit: { ru: 'Отправить заявку', kk: 'Өтінімді жіберу', en: 'Submit Request' },
    submitting: { ru: 'Отправка...', kk: 'Жіберілуде...', en: 'Submitting...' },
    fillAll: { ru: 'Заполните все поля', kk: 'Барлық өрістерді толтырыңыз', en: 'Fill in all fields' },
  };

  const getLabel = (key: keyof typeof labels) => labels[key][language] || labels[key].en;

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
      .select(`*, car_brands (brand_name)`)
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
      toast.error(getLabel('fillAll'));
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

  const getDateLocale = () => {
    if (language === 'ru') return ru;
    if (language === 'kk') return kk;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === 'details' ? setStep('partner') : navigate("/services")}
            className="rounded-full h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </Button>
          <h1 className="text-xl font-bold">{getLabel('title')}</h1>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {step === 'partner' ? (
          <>
            <p className="text-lg font-medium mb-2">{getLabel('selectService')}</p>
            {partners.map((partner) => (
              <button
                key={partner.id}
                className="w-full p-4 rounded-2xl bg-muted/30 text-left hover:bg-muted/50 transition-colors"
                onClick={() => handlePartnerSelect(partner)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{partner.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span>{partner.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{partner.address}, {partner.city}</span>
                    </div>
                    {partner.phone_number && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{partner.phone_number}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            {/* Selected Partner */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{selectedPartner?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPartner?.address}</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Vehicle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{getLabel('vehicle')}</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                    <SelectValue placeholder={getLabel('selectVehicle')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id} className="rounded-lg">
                        {vehicle.car_brands.brand_name} {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Master */}
              {masters.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {getLabel('master')} <span className="text-muted-foreground text-xs">({getLabel('optional')})</span>
                  </Label>
                  <Select value={masterId} onValueChange={setMasterId}>
                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                      <SelectValue placeholder={getLabel('selectMaster')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {masters.map((master) => (
                        <SelectItem key={master.id} value={master.id} className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{master.full_name}</span>
                            {master.specialization && (
                              <span className="text-xs text-muted-foreground">({master.specialization})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Service Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{getLabel('workType')}</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                    <SelectValue placeholder={getLabel('selectWorkType')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="rounded-lg">
                        {type.label[language] || type.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{getLabel('date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start rounded-xl bg-muted/50 border-0 font-normal hover:bg-muted/70",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: getDateLocale() }) : getLabel('selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{getLabel('time')}</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0">
                    <SelectValue placeholder={getLabel('selectTime')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{getLabel('description')}</Label>
                <Textarea
                  placeholder={getLabel('descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="rounded-xl bg-muted/50 border-0 resize-none"
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full h-14 text-lg font-semibold rounded-2xl"
                disabled={loading}
              >
                {loading ? getLabel('submitting') : getLabel('submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceBooking;
