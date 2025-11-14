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
import { cn } from "@/lib/utils";
import { kazakhstanCities } from "@/data/kazakhstan-cities";
import { Card } from "@/components/ui/card";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    city: '',
    firstName: '',
    lastName: '',
  });
  
  const [isCityOpen, setIsCityOpen] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.city || !formData.firstName || !formData.lastName) {
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

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          city: formData.city,
          first_name: formData.firstName,
          last_name: formData.lastName,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      navigate('/');
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
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-4">{t('profileSetup')}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t('city')}</Label>
              <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCityOpen}
                    className="w-full justify-between"
                  >
                    {formData.city || t('selectCity')}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('searchCity')} />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>{t('noCityFound')}</CommandEmpty>
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
                          <div>{city}</div>
                        </CommandItem>
                      ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('firstName')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder={t('firstName')}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('lastName')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder={t('lastName')}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('loading') : t('complete')}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
