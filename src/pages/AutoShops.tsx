import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoShops = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('autoShops')}
      subtitle="Скоро: каталог проверенных автомагазинов вашего города"
    />
  );
};

export default AutoShops;