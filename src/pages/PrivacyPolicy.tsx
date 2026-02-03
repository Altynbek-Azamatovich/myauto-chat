import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t('privacyPolicy')}</h1>
      </header>

      <div className="px-4 pb-12 max-w-2xl mx-auto">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Политика конфиденциальности</h2>
            <p className="text-sm text-muted-foreground">Дата вступления в силу: 3 февраля 2026 г.</p>
          </div>

          <Section title="1. Введение">
            <p>
              Добро пожаловать в myAuto. Мы уважаем вашу конфиденциальность и стремимся защитить ваши персональные данные. 
              Настоящая политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию.
            </p>
          </Section>

          <Section title="2. Какие данные мы собираем">
            <ul className="space-y-2">
              <li>• Номер телефона для аутентификации</li>
              <li>• Имя, фамилия и отчество</li>
              <li>• Город проживания</li>
              <li>• Информация об автомобиле (марка, модель, год, гос. номер)</li>
              <li>• Фотографии для диагностики автомобиля</li>
              <li>• История обслуживания</li>
              <li>• Данные о местоположении (только для функции помощи на дороге)</li>
            </ul>
          </Section>

          <Section title="3. Как мы используем ваши данные">
            <ul className="space-y-2">
              <li>• Для предоставления услуг приложения</li>
              <li>• Для связи с вами по вопросам обслуживания</li>
              <li>• Для улучшения нашего сервиса</li>
              <li>• Для обеспечения безопасности аккаунта</li>
            </ul>
          </Section>

          <Section title="4. Хранение и защита данных">
            <p>
              Все данные хранятся на защищённых серверах с использованием шифрования. 
              Мы не передаём ваши персональные данные третьим лицам без вашего согласия, 
              за исключением случаев, предусмотренных законодательством.
            </p>
          </Section>

          <Section title="5. Ваши права">
            <ul className="space-y-2">
              <li>• Право на доступ к своим данным</li>
              <li>• Право на исправление неточных данных</li>
              <li>• Право на удаление аккаунта и всех связанных данных</li>
              <li>• Право на отзыв согласия на обработку данных</li>
            </ul>
          </Section>

          <Section title="6. Удаление аккаунта">
            <p>
              Вы можете удалить свой аккаунт в любое время через настройки профиля или отправить запрос на удаление данных 
              по адресу <a href="https://myautoplus.kz/delete-account-request" className="text-primary underline">myautoplus.kz/delete-account-request</a>. 
              При удалении аккаунта все ваши персональные данные будут безвозвратно удалены.
            </p>
          </Section>

          <Section title="7. Контакты">
            <p>
              Если у вас есть вопросы по поводу данной политики конфиденциальности, 
              свяжитесь с нами по адресу: <a href="mailto:support@myauto.kz" className="text-primary underline">support@myauto.kz</a>
            </p>
          </Section>

          <Section title="8. Изменения политики">
            <p>
              Мы можем обновлять эту политику время от времени. 
              О существенных изменениях мы уведомим вас через приложение.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      <div className="text-[15px] text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}
