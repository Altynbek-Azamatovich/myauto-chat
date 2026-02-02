import { ArrowLeft, Wrench, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface UnderDevelopmentProps {
  title: string;
  subtitle?: string;
}

export const UnderDevelopment = ({ title, subtitle }: UnderDevelopmentProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSupport = () => {
    window.open('https://pay.kaspi.kz/pay/devnqngt', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Wrench className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <h2 className="text-xl font-semibold text-center mb-2">
          {t('underDevelopmentTitle')}
        </h2>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground text-center max-w-[280px] mb-8">
            {subtitle}
          </p>
        )}

        <div className="w-full max-w-[280px] space-y-3 mt-4">
          <Button
            onClick={handleSupport}
            variant="outline"
            className="w-full h-12 rounded-2xl gap-2 border-primary/20 hover:bg-primary/5"
          >
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t('supportProject')}</span>
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            {t('supportProjectDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;