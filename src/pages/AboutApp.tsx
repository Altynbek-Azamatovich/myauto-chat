import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutApp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center px-4 pt-6 pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('aboutApp')}</h1>
      </header>

      {/* Content */}
      <div className="px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 font-logo tracking-tight">
            myauto
          </h2>
          <p className="text-muted-foreground">
            {t('aboutTagline')}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            {t('aboutDescription')}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('aboutBenefitsTitle')}</h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-1">{t('aboutBenefit1Title')}</p>
              <p className="text-sm text-muted-foreground">{t('aboutBenefit1Desc')}</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">{t('aboutBenefit2Title')}</p>
              <p className="text-sm text-muted-foreground">{t('aboutBenefit2Desc')}</p>
            </div>
            
            <div>
              <p className="font-medium mb-1">{t('aboutBenefit3Title')}</p>
              <p className="text-sm text-muted-foreground">{t('aboutBenefit3Desc')}</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('aboutMissionTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutMissionText')}
          </p>
        </div>

        {/* Security */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('aboutSecurityTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutSecurityText')}
          </p>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{t('aboutDeveloper')}</p>
          <p className="text-sm text-muted-foreground">{t('aboutVersion')}</p>
          <p className="text-sm text-muted-foreground">{t('aboutContact')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;