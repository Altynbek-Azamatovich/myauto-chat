import { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function DeleteAccountRequest() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone) {
      toast.error('Укажите номер телефона');
      return;
    }

    // Simulate submission
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center gap-4 px-4 py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full hover:bg-muted/30"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('deleteAccountRequest')}</h1>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Запрос отправлен</h2>
            <p className="text-muted-foreground max-w-sm">
              Ваш запрос на удаление аккаунта принят. Мы обработаем его в течение 30 дней 
              и уведомим вас по указанным контактным данным.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="mt-4"
            >
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-lg font-semibold">{t('deleteAccountRequest')}</h1>
      </header>

      <div className="px-4 pb-12 max-w-2xl mx-auto">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Запрос на удаление данных</h2>
            <p className="text-sm text-muted-foreground">
              Заполните форму для удаления вашего аккаунта и всех связанных данных
            </p>
          </div>

          <Section title="Что будет удалено">
            <ul className="space-y-2">
              <li>• Ваш профиль и персональные данные</li>
              <li>• Информация о ваших автомобилях</li>
              <li>• История обслуживания</li>
              <li>• Диагностические отчёты</li>
              <li>• История чатов</li>
            </ul>
          </Section>

          <Section title="Важная информация">
            <p>
              После удаления аккаунта восстановление данных невозможно. 
              Обработка запроса занимает до 30 дней в соответствии с законодательством 
              Республики Казахстан о персональных данных.
            </p>
          </Section>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Номер телефона <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Номер телефона, привязанный к аккаунту
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email (необязательно)
                </label>
                <Input
                  type="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Для уведомления о статусе запроса
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Причина удаления (необязательно)
                </label>
                <Textarea
                  placeholder="Расскажите, почему вы хотите удалить аккаунт"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12"
              variant="destructive"
            >
              Отправить запрос на удаление
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Вопросы? Напишите нам: <a href="mailto:support@myauto.kz" className="text-primary underline">support@myauto.kz</a>
          </p>
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
