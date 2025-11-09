import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { kazakhstanCities } from "@/data/kazakhstan-cities";
import { carBrands, getCarModels } from "@/data/car-brands";
import { carColors } from "@/data/car-colors";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    firstName: '',
    lastName: '',
    patronymic: '',
    carBrand: '',
    carModel: '',
    licensePlate: '',
    carColor: '',
    carYear: new Date().getFullYear(),
    customColor: '',
  });
  
  const [openCity, setOpenCity] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // When brand changes, reset model and update available models
    if (field === 'carBrand') {
      setFormData(prev => ({ ...prev, carModel: '' }));
      setAvailableModels(getCarModels(value as string));
    }
  };

  const validateLicensePlate = (plate: string): boolean => {
    // Казахстанский формат: 3 цифры + 2-3 латинские буквы + 2 цифры
    // Примеры: 123ABC45, 456AB78
    const plateRegex = /^\d{3}[A-Z]{2,3}\d{2}$/;
    return plateRegex.test(plate.toUpperCase());
  };

  const handleSubmit = async () => {
    const requiredFields = ['city', 'firstName', 'lastName', 'carBrand', 'carModel', 'licensePlate', 'carColor'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    // Validate license plate format
    if (!validateLicensePlate(formData.licensePlate)) {
      toast({
        title: "Ошибка",
        description: "Неверный формат гос. номера. Используйте формат: 123ABC45",
        variant: "destructive",
      });
      return;
    }

    // If "Другой цвет" is selected, check if custom color is provided
    const finalColor = formData.carColor === "Другой цвет (указать вручную)" 
      ? formData.customColor 
      : formData.carColor;

    if (!finalColor) {
      toast({
        title: "Ошибка",
        description: "Укажите цвет автомобиля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { error } = await supabase
        .from('profiles')
        .update({
          city: formData.city,
          first_name: formData.firstName,
          last_name: formData.lastName,
          patronymic: formData.patronymic || null,
          car_brand: formData.carBrand,
          car_model: formData.carModel,
          license_plate: formData.licensePlate.toUpperCase(),
          car_color: finalColor,
          car_year: formData.carYear,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      navigate('/');
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 pb-24">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('profileSetup')}</h1>
      </div>

      <div className="flex-1 space-y-4 max-w-md mx-auto w-full">
        {/* City */}
        <div>
          <Label>{t('city')}</Label>
          <Popover open={openCity} onOpenChange={setOpenCity}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCity}
                className="w-full h-12 rounded-xl justify-between"
              >
                {formData.city || "Выберите город..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Поиск города..." />
                <CommandList>
                  <CommandEmpty>Город не найден.</CommandEmpty>
                  <CommandGroup>
                    {kazakhstanCities.map((city) => (
                      <CommandItem
                        key={city.name}
                        value={city.name}
                        onSelect={(currentValue) => {
                          handleChange('city', currentValue === formData.city ? "" : currentValue);
                          setOpenCity(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.city === city.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div>{city.name}</div>
                          <div className="text-xs text-muted-foreground">{city.region}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* First Name */}
        <div>
          <Label htmlFor="firstName">{t('firstName')}</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName">{t('lastName')}</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Patronymic */}
        <div>
          <Label htmlFor="patronymic">{t('patronymic')}</Label>
          <Input
            id="patronymic"
            value={formData.patronymic}
            onChange={(e) => handleChange('patronymic', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Car Brand */}
        <div>
          <Label>{t('carBrand')}</Label>
          <Popover open={openBrand} onOpenChange={setOpenBrand}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openBrand}
                className="w-full h-12 rounded-xl justify-between"
              >
                {formData.carBrand || "Выберите марку..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Поиск марки..." />
                <CommandList>
                  <CommandEmpty>Марка не найдена.</CommandEmpty>
                  <CommandGroup>
                    {carBrands.map((brand) => (
                      <CommandItem
                        key={brand.name}
                        value={brand.name}
                        onSelect={(currentValue) => {
                          handleChange('carBrand', currentValue === formData.carBrand ? "" : currentValue);
                          setOpenBrand(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.carBrand === brand.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Car Model */}
        <div>
          <Label>{t('carModel')}</Label>
          <Popover open={openModel} onOpenChange={setOpenModel}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openModel}
                disabled={!formData.carBrand}
                className="w-full h-12 rounded-xl justify-between"
              >
                {formData.carModel || "Выберите модель..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Поиск модели..." />
                <CommandList>
                  <CommandEmpty>Модель не найдена.</CommandEmpty>
                  <CommandGroup>
                    {availableModels.map((model) => (
                      <CommandItem
                        key={model}
                        value={model}
                        onSelect={(currentValue) => {
                          handleChange('carModel', currentValue === formData.carModel ? "" : currentValue);
                          setOpenModel(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.carModel === model ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {model}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* License Plate */}
        <div>
          <Label htmlFor="licensePlate">{t('licensePlate')}</Label>
          <Input
            id="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => handleChange('licensePlate', e.target.value.toUpperCase())}
            placeholder="123ABC45"
            maxLength={9}
            className="h-12 rounded-xl uppercase"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Формат: 3 цифры + 2-3 буквы + 2 цифры (например: 123ABC45)
          </p>
        </div>

        {/* Car Color */}
        <div>
          <Label>{t('carColor')}</Label>
          <Popover open={openColor} onOpenChange={setOpenColor}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openColor}
                className="w-full h-12 rounded-xl justify-between"
              >
                {formData.carColor || "Выберите цвет..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Поиск цвета..." />
                <CommandList>
                  <CommandEmpty>Цвет не найден.</CommandEmpty>
                  <CommandGroup>
                    {carColors.map((color) => (
                      <CommandItem
                        key={color}
                        value={color}
                        onSelect={(currentValue) => {
                          handleChange('carColor', currentValue === formData.carColor ? "" : currentValue);
                          setOpenColor(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.carColor === color ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {color}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {/* Custom color input - show only if "Другой цвет" is selected */}
          {formData.carColor === "Другой цвет (указать вручную)" && (
            <Input
              value={formData.customColor}
              onChange={(e) => handleChange('customColor', e.target.value)}
              placeholder="Введите цвет"
              className="h-12 rounded-xl mt-2"
            />
          )}
        </div>

        {/* Car Year */}
        <div>
          <Label>{t('carYear')}: {formData.carYear}</Label>
          <Slider
            value={[formData.carYear]}
            onValueChange={(value) => handleChange('carYear', value[0])}
            min={1950}
            max={new Date().getFullYear()}
            step={1}
            className="mt-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1950</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background border-t">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90"
        >
          {t('complete')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileSetup;
