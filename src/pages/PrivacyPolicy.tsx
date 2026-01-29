import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-lg font-semibold">{t('privacyPolicy')}</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Политика конфиденциальности myAuto</h2>
          <p className="text-sm text-muted-foreground mb-4">Дата вступления в силу: 29 января 2025 г.</p>
          
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Введение</h3>
              <p className="text-muted-foreground">
                Добро пожаловать в myAuto. Мы уважаем вашу конфиденциальность и стремимся защитить ваши персональные данные. 
                Настоящая политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Какие данные мы собираем</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Номер телефона для аутентификации</li>
                <li>Имя, фамилия и отчество</li>
                <li>Город проживания</li>
                <li>Информация об автомобиле (марка, модель, год, гос. номер)</li>
                <li>Фотографии для диагностики автомобиля</li>
                <li>История обслуживания</li>
                <li>Данные о местоположении (только для функции помощи на дороге)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Как мы используем ваши данные</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Для предоставления услуг приложения</li>
                <li>Для связи с вами по вопросам обслуживания</li>
                <li>Для улучшения нашего сервиса</li>
                <li>Для обеспечения безопасности аккаунта</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Хранение и защита данных</h3>
              <p className="text-muted-foreground">
                Все данные хранятся на защищённых серверах с использованием шифрования. 
                Мы не передаём ваши персональные данные третьим лицам без вашего согласия, 
                за исключением случаев, предусмотренных законодательством.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Ваши права</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Право на доступ к своим данным</li>
                <li>Право на исправление неточных данных</li>
                <li>Право на удаление аккаунта и всех связанных данных</li>
                <li>Право на отзыв согласия на обработку данных</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Удаление аккаунта</h3>
              <p className="text-muted-foreground">
                Вы можете удалить свой аккаунт в любое время через настройки профиля. 
                При удалении аккаунта все ваши персональные данные будут безвозвратно удалены.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Контакты</h3>
              <p className="text-muted-foreground">
                Если у вас есть вопросы по поводу данной политики конфиденциальности, 
                свяжитесь с нами по адресу: support@myauto.kz
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Изменения политики</h3>
              <p className="text-muted-foreground">
                Мы можем обновлять эту политику время от времени. 
                О существенных изменениях мы уведомим вас через приложение.
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
