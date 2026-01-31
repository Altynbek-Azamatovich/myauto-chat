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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { kazakhstanCities } from "@/data/kazakhstan-cities";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Update profile
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

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-center mb-8">
        <Logo size="md" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Заполните профиль</h1>
        <p className="text-muted-foreground mt-2">Расскажите немного о себе</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Имя <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Введите имя"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Фамилия <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Введите фамилию"
            />
          </div>

          {/* Patronymic */}
          <div className="space-y-2">
            <Label htmlFor="patronymic">
              Отчество <span className="text-muted-foreground text-xs">(необязательно)</span>
            </Label>
            <Input
              id="patronymic"
              value={formData.patronymic}
              onChange={(e) => handleChange('patronymic', e.target.value)}
              placeholder="Введите отчество"
            />
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">
              Возраст <span className="text-destructive">*</span>
            </Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="Введите возраст"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label>
              Пол <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите пол" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мужской</SelectItem>
                <SelectItem value="female">Женский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label>
              Город <span className="text-destructive">*</span>
            </Label>
            <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCityOpen}
                  className="w-full justify-between"
                >
                  {formData.city || "Выберите город"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-[100]" align="start">
                <Command>
                  <CommandInput placeholder="Поиск города..." />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>Город не найден</CommandEmpty>
                    <CommandGroup>
                      {kazakhstanCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            handleChange('city', currentValue);
                            setIsCityOpen(false);
                          }}
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

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={loading || !isFormValid()}
          >
            {loading ? "Сохранение..." : "Продолжить"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
