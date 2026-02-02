import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceBooking = () => {
  const { t } = useLanguage();
  return <UnderDevelopment title={t('servicesTitle')} subtitle="Скоро: запись на СТО онлайн" />;
};

export default ServiceBooking;