import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const Detailing = () => {
  const { t } = useLanguage();
  return <UnderDevelopment title={t('detailing')} subtitle="Скоро: профессиональный уход за вашим автомобилем" />;
};

export default Detailing;