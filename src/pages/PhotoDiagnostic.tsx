import { useState } from 'react';
import { ArrowLeft, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImage from "@/assets/logo-new.png";

const PhotoDiagnostic = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setAnalyzing(true);
    try {
      const base64Image = image.split(',')[1];

      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: { imageBase64: base64Image }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast.success('Анализ завершен');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Ошибка анализа изображения');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-10 w-auto" />

        <div className="w-10" />
      </header>

      <div className="px-4 py-6 space-y-6 pb-32">
        <div>
          <h1 className="text-2xl font-bold mb-2">Фотодиагностика</h1>
          <p className="text-muted-foreground">
            Загрузите фото повреждения или проблемной части автомобиля для AI-анализа
          </p>
        </div>

        <Card className="p-6 space-y-4">
          {!image ? (
            <label className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">Сделать фото</p>
              <p className="text-sm text-muted-foreground">или выбрать из галереи</p>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={image} 
                  alt="Captured" 
                  className="w-full rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setAnalysis(null);
                  }}
                >
                  Удалить
                </Button>
              </div>

              {!analysis && (
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzing}
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Анализ...
                    </>
                  ) : (
                    'Проанализировать'
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>

        {analysis && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap">
              {analysis}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default PhotoDiagnostic;
