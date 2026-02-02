import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const Showroom3D = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('showroom3D')}
      subtitle={t('soonShowroom')}
    />
  );
};

export default Showroom3D;