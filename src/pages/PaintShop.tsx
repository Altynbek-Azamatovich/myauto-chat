import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const PaintShop = () => {
  const { t } = useLanguage();
  return <UnderDevelopment title={t('paintShop')} subtitle="Скоро: покраска и кузовной ремонт" />;
};

export default PaintShop;