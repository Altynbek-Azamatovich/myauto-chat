import { ArrowLeft, Construction, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

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
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center">
            <Construction className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl">🚗</span>
          </div>
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