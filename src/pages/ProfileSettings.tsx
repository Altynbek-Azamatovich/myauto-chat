import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePersistedState } from '@/hooks/usePersistedState';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [formData, setFormData] = usePersistedState('profile_settings_form', {
    phone_number: '',
    first_name: '',
    last_name: '',
    patronymic: '',
    city: '',
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/phone-auth');
      return;
    }
    fetchProfile();
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setFormData({
        phone_number: data.phone_number || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        patronymic: data.patronymic || '',
        city: data.city || '',
      });
      setAvatarUrl((data as any).avatar_url || null);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимальный размер 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    setUploadingAvatar(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl } as any)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Аватар обновлен');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('profileUpdated'));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-full hover:bg-muted/30 hover:text-foreground"
        >
          <ArrowLeft className="h-8 w-8" />
        </Button>
        <h1 className="text-lg font-semibold">{t('profileSettingsTitle')}</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || ''} alt="Avatar" />
                  <AvatarFallback className="bg-muted">
                    <User className="h-16 w-16 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Upload className="h-5 w-5 text-primary-foreground" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
              {uploadingAvatar && (
                <p className="text-sm text-muted-foreground">Загрузка...</p>
              )}
            </div>

            <div>
              <Label>{t('phoneNumber')}</Label>
              <Input
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>{t('profileLastName')}</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('profileFirstName')}</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('profilePatronymic')}</Label>
              <Input
                value={formData.patronymic}
                onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('profileCity')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {t('save')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
