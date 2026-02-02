import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceBooking = () => {
  const { t } = useLanguage();
  return <UnderDevelopment title={t('servicesTitle')} subtitle={t('soonAutoServices')} />;
};

export default ServiceBooking;