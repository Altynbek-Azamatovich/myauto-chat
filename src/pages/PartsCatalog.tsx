import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const PartsCatalog = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('catalog')}
      subtitle="Скоро: каталог автозапчастей"
    />
  );
};

export default PartsCatalog;