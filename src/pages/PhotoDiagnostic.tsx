import { Menu, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import logoImage from "@/assets/logo.png";

const PhotoDiagnostic = () => {
  const { t } = useLanguage();

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-6 pb-3 flex-shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-lg">
          <Menu className="h-6 w-6 text-white" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <div className="w-10" /> {/* Spacer for center alignment */}
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <Card className="max-w-md w-full p-8 text-center space-y-6 bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed">
          <div className="flex justify-center">
            <div className="relative">
              <Camera className="h-16 w-16 text-primary" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">
              {t('comingSoon')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('workingOn')}
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
              <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('aiDamageRecognition')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('instantPhotoAnalysis')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('smartRepairRecommendations')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('costEstimation')}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground italic">
            {t('stayTuned')} 🚀
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PhotoDiagnostic;