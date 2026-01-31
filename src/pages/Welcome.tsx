import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatedCar } from "@/components/AnimatedCar";

const Welcome = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show content after car animation starts
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 800);

    // Show button after content appears
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 1600);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Language Toggle */}
      <div className={`absolute top-4 right-4 z-10 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLanguage(language === 'ru' ? 'kk' : 'ru')} 
          className="bg-muted/50 backdrop-blur-lg text-foreground hover:bg-muted/70"
        >
          <Globe className="h-4 w-4 mr-2" strokeWidth={2.5} />
          {language === 'ru' ? 'РУ' : 'ҚЗ'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-12">
        {/* Car Animation */}
        <div className="relative">
          <AnimatedCar />
        </div>

        {/* Logo and Welcome Text */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Logo */}
          <h1 className="text-5xl font-bold font-logo tracking-tight">
            <span className="text-primary">my</span>
            <span className="text-foreground">auto</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-muted-foreground text-center text-base max-w-[280px]">
            {t('welcome')}
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className={`px-6 pb-12 transition-all duration-500 ease-out ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Button 
          onClick={() => navigate('/phone-auth')} 
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
        >
          {t('continue') || 'Продолжить'}
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
