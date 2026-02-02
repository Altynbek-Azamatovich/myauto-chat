import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { kazakhstanCities } from "@/data/kazakhstan-cities";
import { Logo } from "@/components/Logo";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    age: '',
    gender: '',
    city: '',
  });
  
  const [isCityOpen, setIsCityOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.age &&
      parseInt(formData.age) > 0 &&
      parseInt(formData.age) < 120 &&
      formData.gender &&
      formData.city
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: t('error'),
        description: t('fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          patronymic: formData.patronymic.trim() || null,
          age: parseInt(formData.age),
          gender: formData.gender,
          city: formData.city,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      navigate('/home');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    title: { ru: 'Заполните профиль', kk: 'Профильді толтырыңыз', en: 'Complete Your Profile' },
    subtitle: { ru: 'Расскажите немного о себе', kk: 'Өзіңіз туралы айтып беріңіз', en: 'Tell us a bit about yourself' },
    firstName: { ru: 'Имя', kk: 'Аты', en: 'First Name' },
    firstNamePlaceholder: { ru: 'Введите имя', kk: 'Атыңызды енгізіңіз', en: 'Enter first name' },
    lastName: { ru: 'Фамилия', kk: 'Тегі', en: 'Last Name' },
    lastNamePlaceholder: { ru: 'Введите фамилию', kk: 'Тегіңізді енгізіңіз', en: 'Enter last name' },
    patronymic: { ru: 'Отчество', kk: 'Әкесінің аты', en: 'Patronymic' },
    optional: { ru: 'необязательно', kk: 'міндетті емес', en: 'optional' },
    patronymicPlaceholder: { ru: 'Введите отчество', kk: 'Әкеңіздің атын енгізіңіз', en: 'Enter patronymic' },
    age: { ru: 'Возраст', kk: 'Жасы', en: 'Age' },
    agePlaceholder: { ru: 'Введите возраст', kk: 'Жасыңызды енгізіңіз', en: 'Enter age' },
    gender: { ru: 'Пол', kk: 'Жынысы', en: 'Gender' },
    selectGender: { ru: 'Выберите пол', kk: 'Жынысыңызды таңдаңыз', en: 'Select gender' },
    male: { ru: 'Мужской', kk: 'Ер', en: 'Male' },
    female: { ru: 'Женский', kk: 'Әйел', en: 'Female' },
    city: { ru: 'Город', kk: 'Қала', en: 'City' },
    selectCity: { ru: 'Выберите город', kk: 'Қаланы таңдаңыз', en: 'Select city' },
    searchCity: { ru: 'Поиск города...', kk: 'Қала іздеу...', en: 'Search city...' },
    cityNotFound: { ru: 'Город не найден', kk: 'Қала табылмады', en: 'City not found' },
    continue: { ru: 'Продолжить', kk: 'Жалғастыру', en: 'Continue' },
    saving: { ru: 'Сохранение...', kk: 'Сақталуда...', en: 'Saving...' },
  };

  const getLabel = (key: keyof typeof labels) => labels[key][language] || labels[key].en;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-8 pb-4">
        <Logo size="md" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{getLabel('title')}</h1>
          <p className="text-muted-foreground mt-2">{getLabel('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('firstName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder={getLabel('firstNamePlaceholder')}
              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('lastName')} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder={getLabel('lastNamePlaceholder')}
              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Patronymic */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('patronymic')} <span className="text-muted-foreground text-xs">({getLabel('optional')})</span>
            </Label>
            <Input
              value={formData.patronymic}
              onChange={(e) => handleChange('patronymic', e.target.value)}
              placeholder={getLabel('patronymicPlaceholder')}
              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('age')} <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder={getLabel('agePlaceholder')}
              className="h-12 rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('gender')} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-1">
                <SelectValue placeholder={getLabel('selectGender')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="male" className="rounded-lg">{getLabel('male')}</SelectItem>
                <SelectItem value="female" className="rounded-lg">{getLabel('female')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {getLabel('city')} <span className="text-destructive">*</span>
            </Label>
            <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCityOpen}
                  className="w-full h-12 justify-between rounded-xl bg-muted/50 border-0 font-normal hover:bg-muted/70"
                >
                  {formData.city || getLabel('selectCity')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 rounded-xl" align="start">
                <Command>
                  <CommandInput placeholder={getLabel('searchCity')} className="h-12" />
                  <CommandList className="max-h-[250px] overflow-y-auto">
                    <CommandEmpty>{getLabel('cityNotFound')}</CommandEmpty>
                    <CommandGroup>
                      {kazakhstanCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            handleChange('city', currentValue);
                            setIsCityOpen(false);
                          }}
                          className="rounded-lg"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.city === city ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold rounded-2xl" 
              disabled={loading || !isFormValid()}
            >
              {loading ? getLabel('saving') : getLabel('continue')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
