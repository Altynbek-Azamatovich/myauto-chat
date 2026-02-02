import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const PartsDismantling = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('partsDismantling')}
      subtitle={t('soonUsedParts')}
    />
  );
};

export default PartsDismantling;