import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfService() {
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
        <h1 className="text-lg font-semibold">{t('termsOfService')}</h1>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Пользовательское соглашение myAuto</h2>
          <p className="text-sm text-muted-foreground mb-4">Дата вступления в силу: 3 февраля 2026 г.</p>
          
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-semibold mb-2">1. Общие положения</h3>
              <p className="text-muted-foreground">
                Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
                владельцем мобильного приложения myAuto (далее — «Администрация») и пользователем сети Интернет 
                (далее — «Пользователь»), возникающие при использовании приложения myAuto.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Предмет соглашения</h3>
              <p className="text-muted-foreground">
                Администрация предоставляет Пользователю право использования приложения myAuto и его функционала, включая:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
                <li>Учёт и мониторинг состояния автомобиля</li>
                <li>Поиск и бронирование автосервисов</li>
                <li>Вызов помощи на дороге</li>
                <li>ИИ-диагностику по фотографии</li>
                <li>Общение с ИИ-ассистентом</li>
                <li>Доступ к каталогу запчастей и услуг</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Права и обязанности сторон</h3>
              <p className="text-muted-foreground font-medium mt-2">Пользователь обязуется:</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-1">
                <li>Предоставлять достоверную информацию при регистрации</li>
                <li>Не использовать приложение в противоправных целях</li>
                <li>Не передавать данные своей учётной записи третьим лицам</li>
                <li>Соблюдать правила использования приложения</li>
              </ul>
              <p className="text-muted-foreground font-medium mt-3">Администрация обязуется:</p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-1">
                <li>Обеспечить работоспособность приложения</li>
                <li>Защищать персональные данные Пользователя</li>
                <li>Уведомлять об изменениях в работе сервиса</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Ограничение ответственности</h3>
              <p className="text-muted-foreground">
                Администрация не несёт ответственности за:
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-2">
                <li>Качество услуг, оказываемых партнёрами (автосервисами, магазинами)</li>
                <li>Временные сбои в работе приложения</li>
                <li>Результаты ИИ-диагностики (носят рекомендательный характер)</li>
                <li>Действия третьих лиц</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Интеллектуальная собственность</h3>
              <p className="text-muted-foreground">
                Все права на приложение myAuto, его дизайн, код, контент и товарные знаки принадлежат Администрации. 
                Копирование, распространение или модификация любых элементов приложения без письменного согласия 
                Администрации запрещены.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Порядок разрешения споров</h3>
              <p className="text-muted-foreground">
                Все споры и разногласия решаются путём переговоров. При невозможности достижения соглашения 
                спор передаётся на рассмотрение в суд по месту нахождения Администрации в соответствии 
                с законодательством Республики Казахстан.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Изменение условий</h3>
              <p className="text-muted-foreground">
                Администрация оставляет за собой право изменять условия настоящего Соглашения. 
                Продолжение использования приложения после внесения изменений означает согласие 
                Пользователя с новой редакцией Соглашения.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Контактная информация</h3>
              <p className="text-muted-foreground">
                По всем вопросам, связанным с настоящим Соглашением, обращайтесь: support@myauto.kz
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
