import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsOfService() {
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
        <h1 className="text-lg font-semibold">{t('termsOfService')}</h1>
      </header>

      <div className="px-4 pb-12 max-w-2xl mx-auto">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Пользовательское соглашение</h2>
            <p className="text-sm text-muted-foreground">Дата вступления в силу: 3 февраля 2026 г.</p>
          </div>

          <Section title="1. Общие положения">
            <p>
              Настоящее Пользовательское соглашение регулирует отношения между 
              владельцем мобильного приложения myAuto и пользователем сети Интернет, 
              возникающие при использовании приложения myAuto.
            </p>
          </Section>

          <Section title="2. Предмет соглашения">
            <p className="mb-3">
              Администрация предоставляет Пользователю право использования приложения myAuto и его функционала:
            </p>
            <ul className="space-y-2">
              <li>• Учёт и мониторинг состояния автомобиля</li>
              <li>• Поиск и бронирование автосервисов</li>
              <li>• Вызов помощи на дороге</li>
              <li>• ИИ-диагностика по фотографии</li>
              <li>• Общение с ИИ-ассистентом</li>
              <li>• Доступ к каталогу запчастей и услуг</li>
            </ul>
          </Section>

          <Section title="3. Права и обязанности сторон">
            <p className="font-medium text-foreground mb-2">Пользователь обязуется:</p>
            <ul className="space-y-2 mb-4">
              <li>• Предоставлять достоверную информацию при регистрации</li>
              <li>• Не использовать приложение в противоправных целях</li>
              <li>• Не передавать данные своей учётной записи третьим лицам</li>
              <li>• Соблюдать правила использования приложения</li>
            </ul>
            <p className="font-medium text-foreground mb-2">Администрация обязуется:</p>
            <ul className="space-y-2">
              <li>• Обеспечить работоспособность приложения</li>
              <li>• Защищать персональные данные Пользователя</li>
              <li>• Уведомлять об изменениях в работе сервиса</li>
            </ul>
          </Section>

          <Section title="4. Ограничение ответственности">
            <p className="mb-3">Администрация не несёт ответственности за:</p>
            <ul className="space-y-2">
              <li>• Качество услуг, оказываемых партнёрами (автосервисами, магазинами)</li>
              <li>• Временные сбои в работе приложения</li>
              <li>• Результаты ИИ-диагностики (носят рекомендательный характер)</li>
              <li>• Действия третьих лиц</li>
            </ul>
          </Section>

          <Section title="5. Интеллектуальная собственность">
            <p>
              Все права на приложение myAuto, его дизайн, код, контент и товарные знаки принадлежат Администрации. 
              Копирование, распространение или модификация любых элементов приложения без письменного согласия 
              Администрации запрещены.
            </p>
          </Section>

          <Section title="6. Порядок разрешения споров">
            <p>
              Все споры и разногласия решаются путём переговоров. При невозможности достижения соглашения 
              спор передаётся на рассмотрение в суд по месту нахождения Администрации в соответствии 
              с законодательством Республики Казахстан.
            </p>
          </Section>

          <Section title="7. Изменение условий">
            <p>
              Администрация оставляет за собой право изменять условия настоящего Соглашения. 
              Продолжение использования приложения после внесения изменений означает согласие 
              Пользователя с новой редакцией Соглашения.
            </p>
          </Section>

          <Section title="8. Контактная информация">
            <p>
              По всем вопросам обращайтесь: <a href="mailto:support@myauto.kz" className="text-primary underline">support@myauto.kz</a>
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
