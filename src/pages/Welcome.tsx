import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatedCar } from "@/components/AnimatedCar";

const Welcome = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [showLogo, setShowLogo] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show logo after light beam appears
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1400);

    // Show welcome text after logo
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 1800);

    // Show button after content appears
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 2200);

    return () => {
      clearTimeout(logoTimer);
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
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* Car Animation */}
        <div className="w-full max-w-md">
          <AnimatedCar />
        </div>

        {/* Logo */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-700 ease-out ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-6xl font-bold font-logo tracking-tight">
            <span className="text-primary">my</span>
            <span className="text-foreground">auto</span>
          </h1>
        </div>

        {/* Welcome Text */}
        <div className={`transition-all duration-500 ease-out ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-muted-foreground text-center text-lg">
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
