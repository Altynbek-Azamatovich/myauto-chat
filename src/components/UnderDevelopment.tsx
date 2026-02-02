import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import carImage from '@/assets/car-covered-new.png';
import barrierImage from '@/assets/construction-barrier.png';

interface UnderDevelopmentProps {
  title: string;
  subtitle?: string;
  backPath?: string;
}

export const UnderDevelopment = ({ title, subtitle, backPath = '/services' }: UnderDevelopmentProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(backPath)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>

      {/* Content */}
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        {/* Animation Container */}
        <div className="relative w-screen -mx-6 h-[clamp(240px,52vw,360px)] mb-6 flex items-center justify-between overflow-hidden">
          {/* Construction Barrier - slides from left */}
          <img
            src={barrierImage}
            alt="Under construction"
            className="block h-[clamp(144px,33vw,240px)] w-auto object-contain will-change-transform animate-[slide-barrier_4s_ease-in-out_infinite]"
          />
          
          {/* Car - slides from right */}
          <img
            src={carImage}
            alt="Car"
            className="block h-[clamp(168px,39vw,285px)] w-auto object-contain will-change-transform animate-[slide-car_4s_ease-in-out_infinite]"
          />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold mb-3">
          {t('underDevelopmentTitle')}
        </h2>
        <p className="text-muted-foreground mb-2 max-w-sm leading-relaxed">
          {t('underDevelopmentDescShort')}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground/70 mb-8">{subtitle}</p>
        )}

        {/* Support Button */}
        <div className="space-y-3 w-full max-w-xs">
          <Button 
            className="w-full gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold rounded-xl h-12"
            onClick={() => {
              window.open('https://pay.kaspi.kz/pay/devnqngt', '_blank');
            }}
          >
            <Heart className="h-4 w-4" />
            {t('supportProject')}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('supportProjectDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};