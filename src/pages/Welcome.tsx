import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import welcomeImage from "@/assets/welcome-hero.jpg";
import { Globe } from "lucide-react";
const Welcome = () => {
  const navigate = useNavigate();
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')} className="bg-black/20 backdrop-blur-lg text-white hover:bg-black/30">
          <Globe className="h-4 w-4 mr-2" />
          {language === 'ru' ? 'РУ' : 'ҚЗ'}
        </Button>
      </div>

      {/* Logo */}
      <div className="pt-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-primary">my</span>
          <span className="text-muted-foreground">Auto</span>
        </h1>
      </div>

      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <img src={welcomeImage} alt="Welcome" className="max-w-full h-auto object-contain" />
      </div>

      {/* Welcome Text */}
      <div className="px-4 pb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('welcome')}
        </h2>
      </div>

      {/* Start Button */}
      <div className="px-4 pb-8">
        <Button onClick={() => navigate('/role-selection')} className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90">
          {t('getStarted')}
        </Button>
      </div>
    </div>;
};
export default Welcome;