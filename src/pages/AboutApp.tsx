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
      <header className="flex items-center gap-4 px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{t('aboutApp')}</h1>
      </header>

      {/* Content */}
      <div className="px-6 py-6 space-y-8">
        {/* Hero */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">myauto</h2>
          <p className="text-muted-foreground">{t('aboutTagline')}</p>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {t('aboutDescription')}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">{t('aboutBenefitsTitle')}</h3>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{t('aboutBenefit1Title')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('aboutBenefit1Desc')}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium">{t('aboutBenefit2Title')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('aboutBenefit2Desc')}
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium">{t('aboutBenefit3Title')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('aboutBenefit3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">{t('aboutMissionTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutMissionDesc')}
          </p>
        </div>

        {/* Security */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold">{t('aboutSecurityTitle')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutSecurityDesc')}
          </p>
        </div>

        {/* Footer Info */}
        <div className="pt-6 border-t border-border space-y-2 text-center">
          <p className="text-sm text-muted-foreground">{t('aboutDeveloper')}</p>
          <p className="text-sm text-muted-foreground">{t('aboutVersion')}</p>
          <p className="text-sm text-muted-foreground">{t('aboutContact')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;