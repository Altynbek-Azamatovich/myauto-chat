import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoShops = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('autoShops')}
      subtitle={t('soonAutoShops')}
    />
  );
};

export default AutoShops;