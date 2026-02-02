import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsPage = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('news')}
      subtitle={t('soonNews')}
    />
  );
};

export default NewsPage;