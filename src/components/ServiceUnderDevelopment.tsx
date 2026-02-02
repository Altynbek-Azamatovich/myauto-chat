import { Construction, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceUnderDevelopmentProps {
  kaspiLink?: string;
}

export const ServiceUnderDevelopment = ({ kaspiLink }: ServiceUnderDevelopmentProps) => {
  const { t, language } = useLanguage();
  
  const texts = {
    ru: {
      title: "Раздел в разработке",
      description: "Мы активно работаем над улучшением этого раздела. Скоро здесь появятся новые функции!",
      support: "Поддержать проект"
    },
    kk: {
      title: "Бөлім әзірленуде",
      description: "Біз бұл бөлімді жақсарту үшін белсенді жұмыс істеп жатырмыз. Жақында жаңа мүмкіндіктер пайда болады!",
      support: "Жобаны қолдау"
    },
    en: {
      title: "Section Under Development",
      description: "We are actively working on improving this section. New features coming soon!",
      support: "Support the Project"
    }
  };

  const currentLang = language as keyof typeof texts;
  const content = texts[currentLang] || texts.ru;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-2xl p-5 mb-4">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
          <Construction className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{content.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{content.description}</p>
          <Button 
            size="sm" 
            className="h-9 rounded-xl gap-2"
            onClick={() => {
              if (kaspiLink) {
                window.open(kaspiLink, '_blank');
              }
            }}
          >
            <Heart className="h-4 w-4" />
            {content.support}
          </Button>
        </div>
      </div>
    </div>
  );
};
