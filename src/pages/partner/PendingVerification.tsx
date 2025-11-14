import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PendingVerification = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <Clock className="h-24 w-24 text-primary animate-pulse" />
            <CheckCircle2 className="h-8 w-8 text-primary absolute -bottom-1 -right-1 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ru' ? 'Идет верификация' : 'Верификация жүріп жатыр'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ru' 
              ? 'Ваш партнерский аккаунт проходит проверку'
              : 'Сіздің серіктес аккаунтыңыз тексерілуде'}
          </p>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
          <p className="text-foreground">
            {language === 'ru'
              ? 'Мы проверяем предоставленную информацию. После успешной верификации вы получите полный доступ ко всем функциям партнерского приложения.'
              : 'Біз берілген ақпаратты тексереміз. Сәтті верификациядан кейін сіз серіктестік қосымшасының барлық функцияларына толық қатынай аласыз.'}
          </p>
          
          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {language === 'ru'
                ? 'Обычно проверка занимает от нескольких часов до 1 рабочего дня'
                : 'Әдетте тексеру бірнеше сағаттан 1 жұмыс күніне дейін уақыт алады'}
            </p>
          </div>

          <div className="flex items-start gap-3 text-left">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              {language === 'ru'
                ? 'Мы отправим уведомление на ваш номер телефона после завершения проверки'
                : 'Тексеру аяқталғаннан кейін біз сіздің телефон нөміріңізге хабарлама жібереміз'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-12 text-lg rounded-2xl"
        >
          {language === 'ru' ? 'Выйти' : 'Шығу'}
        </Button>
      </div>
    </div>
  );
};

export default PendingVerification;
