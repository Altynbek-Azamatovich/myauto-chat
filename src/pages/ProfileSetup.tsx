import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";

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
    carYear: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = ['city', 'firstName', 'lastName', 'carBrand', 'carModel', 'licensePlate', 'carColor', 'carYear'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
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
          license_plate: formData.licensePlate,
          car_color: formData.carColor,
          car_year: parseInt(formData.carYear),
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
          <Label htmlFor="city">{t('city')}</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="h-12 rounded-xl"
          />
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
          <Label htmlFor="carBrand">{t('carBrand')}</Label>
          <Input
            id="carBrand"
            value={formData.carBrand}
            onChange={(e) => handleChange('carBrand', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Car Model */}
        <div>
          <Label htmlFor="carModel">{t('carModel')}</Label>
          <Input
            id="carModel"
            value={formData.carModel}
            onChange={(e) => handleChange('carModel', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* License Plate */}
        <div>
          <Label htmlFor="licensePlate">{t('licensePlate')}</Label>
          <Input
            id="licensePlate"
            value={formData.licensePlate}
            onChange={(e) => handleChange('licensePlate', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Car Color */}
        <div>
          <Label htmlFor="carColor">{t('carColor')}</Label>
          <Input
            id="carColor"
            value={formData.carColor}
            onChange={(e) => handleChange('carColor', e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Car Year */}
        <div>
          <Label htmlFor="carYear">{t('carYear')}</Label>
          <Input
            id="carYear"
            type="number"
            value={formData.carYear}
            onChange={(e) => handleChange('carYear', e.target.value)}
            className="h-12 rounded-xl"
          />
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
