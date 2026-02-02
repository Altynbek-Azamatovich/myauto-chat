import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Check, ChevronsUpDown, ChevronRight, Shield, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePersistedState } from '@/hooks/usePersistedState';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { kazakhstanCities } from '@/data/kazakhstan-cities';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteInfo, setShowDeleteInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимальный размер 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    setUploadingAvatar(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

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

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Необходимо войти в аккаунт');
        return;
      }

      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      localStorage.clear();
      
      toast.success('Аккаунт успешно удалён');
      navigate('/welcome', { replace: true });
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Не удалось удалить аккаунт');
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
      setShowDeleteInfo(false);
    }
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

      <div className="p-4 space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-28 w-28">
              <AvatarImage src={avatarUrl || ''} alt="Avatar" />
              <AvatarFallback className="bg-muted">
                <User className="h-14 w-14 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <label 
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 text-primary-foreground" />
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
            <p className="text-sm text-muted-foreground">{t('loading')}</p>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('phoneNumber')}</Label>
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              disabled
              className="bg-muted/50 border-0 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('profileLastName')}</Label>
            <Input
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="border-0 bg-muted/50 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('profileFirstName')}</Label>
            <Input
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="border-0 bg-muted/50 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('profilePatronymic')}</Label>
            <Input
              value={formData.patronymic}
              onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              className="border-0 bg-muted/50 rounded-xl h-12"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">{t('profileCity')}</Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={cityOpen}
                  className="w-full justify-between bg-muted/50 border-0 rounded-xl h-12 hover:bg-muted/70"
                >
                  {formData.city || t('selectCity')}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-[100]" align="start">
                <Command>
                  <CommandInput placeholder={t('searchCity')} />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>{t('noCityFound')}</CommandEmpty>
                    <CommandGroup>
                      {kazakhstanCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            setFormData({ ...formData, city: currentValue });
                            setCityOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.city === city ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
            {t('save')}
          </Button>
        </form>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            variant="ghost" 
            className="w-full justify-between h-14 bg-muted/30 hover:bg-muted/50 rounded-2xl px-4" 
            onClick={() => navigate('/privacy-policy')}
          >
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span>{t('privacyPolicy')}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between h-14 bg-muted/30 hover:bg-destructive/10 rounded-2xl px-4 text-destructive" 
            onClick={() => setShowDeleteInfo(true)}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5" />
              <span>{t('deleteAccount')}</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Delete Account Info Dialog */}
      <AlertDialog open={showDeleteInfo} onOpenChange={setShowDeleteInfo}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t('deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <p>{t('deleteAccountWarning')}</p>
              <ul className="text-left space-y-2 text-sm">
                <li>• Все ваши данные будут удалены безвозвратно</li>
                <li>• История сервисов и автомобили будут удалены</li>
                <li>• Восстановление аккаунта невозможно</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              variant="destructive" 
              className="w-full rounded-xl"
              onClick={() => {
                setShowDeleteInfo(false);
                setShowDeleteConfirm(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteAccount')}
            </Button>
            <AlertDialogCancel className="w-full rounded-xl mt-0">{t('cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">{t('deleteAccountConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('deleteAccountConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl m-0">{t('no')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('yes')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
