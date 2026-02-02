import { UnderDevelopment } from "@/components/UnderDevelopment";
import { useLanguage } from "@/contexts/LanguageContext";

const AutoForum = () => {
  const { t } = useLanguage();
  
  return (
    <UnderDevelopment 
      title={t('autoForum')}
      subtitle={t('soonAutoForum')}
    />
  );
};

export default AutoForum;