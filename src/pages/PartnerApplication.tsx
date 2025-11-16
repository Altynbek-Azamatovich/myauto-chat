import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { kazakhstanCities } from "@/data/kazakhstan-cities";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const PartnerApplication = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState("+7");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+7')) {
      return '+7';
    }
    
    const digits = cleaned.slice(2);
    const limitedDigits = digits.slice(0, 10);
    
    let formatted = '+7';
    if (limitedDigits.length > 0) {
      formatted += ' ' + limitedDigits.slice(0, 3);
    }
    if (limitedDigits.length > 3) {
      formatted += ' ' + limitedDigits.slice(3, 6);
    }
    if (limitedDigits.length > 6) {
      formatted += ' ' + limitedDigits.slice(6, 10);
    }
    
    return formatted;
  };

  const isPhoneValid = (phone: string) => {
    const phoneRegex = /^\+7 \d{3} \d{3} \d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    if (!isPhoneValid(phone)) {
      toast({
        title: t('error'),
        description: t('invalidPhone'),
        variant: "destructive",
      });
      return;
    }

    if (!fullName.trim()) {
      toast({
        title: t('error'),
        description: t('fullNameRequired'),
        variant: "destructive",
      });
      return;
    }

    if (!businessDescription.trim()) {
      toast({
        title: t('error'),
        description: t('businessDescriptionRequired'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      
      const { error } = await supabase
        .from('partner_applications' as any)
        .insert([{
          phone_number: cleanPhone,
          full_name: fullName.trim(),
          business_name: businessName.trim() || null,
          business_description: businessDescription.trim(),
          city: city.trim() || null,
        }] as any);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('applicationSubmitted'),
      });

      // Clear form and navigate back
      setTimeout(() => {
        navigate('/role-selection');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      toast({
        title: t('error'),
        description: error.message || t('applicationError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'ru' ? 'РУ' : 'ҚЗ'}
        </Button>
      </div>

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pt-12">
        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('partnerApplicationTitle')}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground mb-8">
          {t('partnerApplicationSubtitle')}
        </p>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('phoneNumber')}
          </label>
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <span className="text-2xl">🇰🇿</span>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="+7 XXX XXX XXXX"
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        {/* Full Name Input */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('fullName')} *
          </label>
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fullNameShort')}
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        {/* Business Name Input */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('businessName')}
          </label>
          <div className="flex items-center gap-2 p-4 border border-input rounded-2xl bg-background">
            <Input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t('businessNamePlaceholder')}
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
          </div>
        </div>

        {/* City Select */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('city')}
          </label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full h-14 text-lg rounded-2xl border-input justify-between"
              >
                {city || t('selectCity')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-[100]" align="start">
              <Command>
                <CommandInput placeholder={t('searchCity')} />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>{t('noCityFound')}</CommandEmpty>
                  <CommandGroup>
                    {kazakhstanCities.map((cityName) => (
                      <CommandItem
                        key={cityName}
                        value={cityName}
                        onSelect={(currentValue) => {
                          setCity(currentValue);
                          setCityOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            city === cityName ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {cityName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Business Description */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">
            {t('businessDescription')} *
          </label>
          <div className="p-4 border border-input rounded-2xl bg-background">
            <Textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder={t('businessDescriptionPlaceholder')}
              className="border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[120px]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 mb-4"
        >
          {t('submitApplication')}
        </Button>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground">
          {t('applicationProcessInfo')}
        </p>
      </div>
    </div>
  );
};

export default PartnerApplication;
