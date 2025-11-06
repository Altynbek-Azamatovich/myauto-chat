import { ArrowLeft, Car, MessageSquare, Camera, Wrench, Shield, Star, Users, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AboutApp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: <Car className="h-8 w-8 text-app-orange" />,
      title: t('aboutFeature1Title'),
      description: t('aboutFeature1Desc')
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-app-green" />,
      title: t('aboutFeature2Title'),
      description: t('aboutFeature2Desc')
    },
    {
      icon: <Camera className="h-8 w-8 text-app-orange" />,
      title: t('aboutFeature3Title'),
      description: t('aboutFeature3Desc')
    },
    {
      icon: <Wrench className="h-8 w-8 text-app-green" />,
      title: t('aboutFeature4Title'),
      description: t('aboutFeature4Desc')
    }
  ];

  const benefits = [
    { icon: <Shield className="h-6 w-6" />, text: t('aboutBenefit1') },
    { icon: <Star className="h-6 w-6" />, text: t('aboutBenefit2') },
    { icon: <Clock className="h-6 w-6" />, text: t('aboutBenefit3') },
    { icon: <Zap className="h-6 w-6" />, text: t('aboutBenefit4') },
    { icon: <Users className="h-6 w-6" />, text: t('aboutBenefit5') }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="flex items-center px-4 pt-6 pb-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/')}
          className="rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('aboutApp')}</h1>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <Card className="p-6 bg-gradient-to-br from-app-orange/10 to-app-green/10 border-none">
          <h2 className="text-2xl font-bold mb-3">{t('aboutWelcomeTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('aboutWelcomeText')}
          </p>
        </Card>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('aboutFeaturesTitle')}</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('aboutBenefitsTitle')}</h3>
          <Card className="p-4">
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-app-green flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <p className="text-sm">{benefit.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* How to Use Guide */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('aboutGuideTitle')}</h3>
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-app-orange text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-semibold">{t('aboutStep1Title')}</h4>
                </div>
                <p className="text-sm text-muted-foreground ml-10">{t('aboutStep1Desc')}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-app-orange text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-semibold">{t('aboutStep2Title')}</h4>
                </div>
                <p className="text-sm text-muted-foreground ml-10">{t('aboutStep2Desc')}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-app-green text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-semibold">{t('aboutStep3Title')}</h4>
                </div>
                <p className="text-sm text-muted-foreground ml-10">{t('aboutStep3Desc')}</p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-app-green text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <h4 className="font-semibold">{t('aboutStep4Title')}</h4>
                </div>
                <p className="text-sm text-muted-foreground ml-10">{t('aboutStep4Desc')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Version Info */}
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">myAuto v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">© 2025 myAuto. {t('aboutRights')}</p>
        </Card>
      </div>
    </div>
  );
};

export default AboutApp;
