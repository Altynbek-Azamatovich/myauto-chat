import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const CarWash = () => {
  const { t } = useLanguage();
  return <UnderDevelopment title={t('carWash')} subtitle="Скоро: автомойки рядом с вами" />;
};

export default CarWash;