import { ArrowLeft, Smartphone, Shield, Zap, Users, MessageCircle, Car, Wrench, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutApp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: Car, title: t('aboutFeature1Title'), desc: t('aboutFeature1Desc') },
    { icon: Wrench, title: t('aboutFeature2Title'), desc: t('aboutFeature2Desc') },
    { icon: MessageCircle, title: t('aboutFeature3Title'), desc: t('aboutFeature3Desc') },
    { icon: Bell, title: t('aboutFeature4Title'), desc: t('aboutFeature4Desc') },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{t('aboutApp')}</h1>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* App Info */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">myAuto</h2>
            <p className="text-sm text-muted-foreground">{t('aboutVersion')}</p>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 bg-muted/20 rounded-2xl">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutDescription')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">{t('aboutFeaturesTitle')}</h3>
          <div className="bg-muted/20 rounded-2xl overflow-hidden divide-y divide-border/50">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Updates */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground px-1">{t('aboutUpdatesTitle')}</h3>
          <div className="bg-muted/20 rounded-2xl overflow-hidden divide-y divide-border/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">v1.2.0</span>
                <span className="text-xs text-muted-foreground">{t('aboutUpdateDate1')}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('aboutUpdate1')}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">v1.1.0</span>
                <span className="text-xs text-muted-foreground">{t('aboutUpdateDate2')}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('aboutUpdate2')}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">v1.0.0</span>
                <span className="text-xs text-muted-foreground">{t('aboutUpdateDate3')}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t('aboutUpdate3')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">© 2025 myAuto</p>
          <p className="text-xs text-muted-foreground mt-1">{t('aboutRights')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
