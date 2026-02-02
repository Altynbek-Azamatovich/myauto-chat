import { ArrowLeft, Sparkles, Zap, Shield, MessageSquare, Car, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutApp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: Car, label: t('aboutFeature1Title') },
    { icon: MessageSquare, label: t('aboutFeature2Title') },
    { icon: Camera, label: t('aboutFeature3Title') },
    { icon: Shield, label: t('aboutFeature4Title') },
  ];

  const updates = [
    { version: '1.2.0', date: t('aboutUpdateDate1'), text: t('aboutUpdate1') },
    { version: '1.1.0', date: t('aboutUpdateDate2'), text: t('aboutUpdate2') },
    { version: '1.0.0', date: t('aboutUpdateDate3'), text: t('aboutUpdate3') },
  ];

  return (
    <div className="min-h-screen bg-background">
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
      <div className="px-5 py-6 pb-24 space-y-8">
        {/* Logo & Version */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">myAuto</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('aboutVersion')}</p>
        </div>

        {/* Description */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t('aboutDescription')}
          </p>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('aboutFeaturesTitle')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium flex-1">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Updates */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('aboutUpdatesTitle')}</h3>
          <div className="space-y-3">
            {updates.map((update, index) => (
              <div 
                key={index}
                className="p-4 rounded-2xl bg-muted/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold">v{update.version}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{update.text}</p>
              </div>
            ))}
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
