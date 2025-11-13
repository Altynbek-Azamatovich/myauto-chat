import { useState } from 'react';
import { ArrowLeft, Camera, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logoImage from "@/assets/logo.svg";
import carDiagnosticImage from "@/assets/car-diagnostic-new.png";
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
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-photo', {
        body: {
          imageBase64: base64Image
        }
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
  return <div className="min-h-screen">
      <header className="flex items-center justify-between px-4 py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted/30">
          <ArrowLeft className="h-8 w-8" />
        </Button>

        <img src={logoImage} alt="myAuto" className="h-12 w-auto" />

        <div className="w-10" />
      </header>

      <div className="py-4 space-y-3 pb-32">
        <div className="text-center px-4">
          <p className="text-foreground text-base font-bold leading-tight">
            Сделай фото автомобиля<br />
            ИИ распознает повреждения<br />
            и предложит решение
          </p>
        </div>

        <div className="w-full relative">
          <img src={carDiagnosticImage} alt="Автомобиль для диагностики" className="w-full h-auto object-contain" />
          {/* Scanner overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[70%] h-[55%]">
              {/* Scanner corners with glow effect */}
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[5px] border-l-[5px] border-primary rounded-tl-2xl animate-pulse" 
                   style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}></div>
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[5px] border-r-[5px] border-primary rounded-tr-2xl animate-pulse" 
                   style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}></div>
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[5px] border-l-[5px] border-primary rounded-bl-2xl animate-pulse" 
                   style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}></div>
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[5px] border-r-[5px] border-primary rounded-br-2xl animate-pulse" 
                   style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}></div>
              
              {/* Scanning line animation */}
              {!image && (
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div 
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                    style={{
                      animation: 'scan 2s ease-in-out infinite',
                      filter: 'drop-shadow(0 0 6px hsl(var(--primary)))',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-2">
          {!image ? <label className="flex flex-col items-center justify-center min-h-[120px] cursor-pointer">
              <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
              <Camera className="h-16 w-16 text-primary mb-2" />
              <div className="bg-white px-6 py-2 rounded-full">
                <p className="text-sm font-semibold text-primary">Запустить камеру</p>
              </div>
            </label> : <div className="space-y-4">
              <div className="relative">
                <img src={image} alt="Captured" className="w-full rounded-lg" />
                <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => {
              setImage(null);
              setAnalysis(null);
            }}>
                  Удалить
                </Button>
              </div>

              {!analysis && <Button onClick={handleAnalyze} disabled={analyzing} className="w-full" size="lg">
                  {analyzing ? <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Анализ...
                    </> : 'Проанализировать'}
                 </Button>}
            </div>}
        </div>

        {analysis && <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="whitespace-pre-wrap">
              {analysis}
            </AlertDescription>
          </Alert>}
      </div>
    </div>;
};
export default PhotoDiagnostic;