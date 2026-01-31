import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Loader2, Trash2, RefreshCw, Save, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Logo from "@/components/Logo";
import carDiagnosticImage from "@/assets/car-diagnostic-new.png";
import { usePersistedState } from '@/hooks/usePersistedState';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface DiagnosticReport {
  id: string;
  image_url: string;
  analysis: string;
  created_at: string;
}

const PhotoDiagnostic = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [image, setImage] = usePersistedState<string | null>('photo-diagnostic-image', null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = usePersistedState<string | null>('photo-diagnostic-analysis', null);
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('diagnostic_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('fileSizeError'));
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
      toast.success(t('analysisComplete'));
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || t('analysisError'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveReport = async () => {
    if (!image || !analysis) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Необходимо войти в аккаунт');
        return;
      }

      // Upload image to storage
      const base64Data = image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('diagnostics')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('diagnostics')
        .getPublicUrl(fileName);

      // Save report to database
      const { error: insertError } = await supabase
        .from('diagnostic_reports')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          analysis: analysis
        });

      if (insertError) throw insertError;

      toast.success('Отчёт сохранён');
      setImage(null);
      setAnalysis(null);
      fetchReports();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = () => {
    setImage(null);
    setAnalysis(null);
  };

  const handleNewPhoto = () => {
    setImage(null);
    setAnalysis(null);
    // Trigger file input
    const input = document.getElementById('camera-input') as HTMLInputElement;
    if (input) input.click();
  };

  // Show selected report view
  if (selectedReport) {
    return (
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSelectedReport(null)} 
            className="rounded-full hover:bg-muted/30"
          >
            <ArrowLeft className="h-[25px] w-[25px] text-foreground" strokeWidth={2.5} />
          </Button>
          <Logo size="md" />
          <div className="w-10" />
        </header>

        <div className="px-4 py-6 space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {format(new Date(selectedReport.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
          </p>
          
          <img 
            src={selectedReport.image_url} 
            alt="Diagnostic" 
            className="w-full rounded-2xl" 
          />
          
          <Card className="p-4 bg-card/80 backdrop-blur-sm">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {selectedReport.analysis}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Show history view
  if (showHistory) {
    return (
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowHistory(false)} 
            className="rounded-full hover:bg-muted/30"
          >
            <ArrowLeft className="h-[25px] w-[25px] text-foreground" strokeWidth={2.5} />
          </Button>
          <Logo size="md" />
          <div className="w-10" />
        </header>

        <div className="px-4 py-6">
          <h2 className="text-lg font-bold mb-4">История отчётов</h2>
          
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Пока нет сохранённых отчётов
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <Card 
                  key={report.id}
                  className="p-3 flex gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedReport(report)}
                >
                  <img 
                    src={report.image_url} 
                    alt="Diagnostic" 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.created_at), 'd MMMM yyyy', { locale: ru })}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2 mt-1">
                      {report.analysis}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Photo result view with white overlay
  if (image) {
    return (
      <div className="min-h-screen bg-background">
        <header className="flex items-center justify-between px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDeletePhoto} 
            className="rounded-full hover:bg-muted/30"
          >
            <ArrowLeft className="h-[25px] w-[25px] text-foreground" strokeWidth={2.5} />
          </Button>
          <Logo size="md" />
          <div className="w-10" />
        </header>

        <div className="px-4 py-6 space-y-4 pb-32">
          {/* Photo preview */}
          <div className="bg-card rounded-2xl p-4 shadow-lg">
            <img 
              src={image} 
              alt="Captured" 
              className="w-full rounded-xl" 
            />
            
            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDeletePhoto}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить фото
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleNewPhoto}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Новое фото
              </Button>
            </div>
          </div>

          {/* Hidden file input for new photo */}
          <input 
            id="camera-input"
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageCapture} 
            className="hidden" 
          />

          {/* Analyze button or Analysis result */}
          {!analysis ? (
            <Button 
              onClick={handleAnalyze} 
              disabled={analyzing} 
              className="w-full" 
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                t('analyze')
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <Card className="p-4 bg-card/80 backdrop-blur-sm">
                <p className="text-sm font-medium mb-2">Пояснение ИИ:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {analysis}
                </p>
              </Card>

              <Button 
                onClick={handleSaveReport} 
                disabled={saving}
                className="w-full" 
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить отчёт
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main scanner view
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full page darkened overlay with cutout for scanner */}
      <div 
        className="fixed inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, 
              rgba(0,0,0,0.35) 0%, 
              rgba(0,0,0,0.35) 28%,
              transparent 28%,
              transparent 72%,
              rgba(0,0,0,0.35) 72%,
              rgba(0,0,0,0.35) 100%
            )
          `,
          maskImage: `
            linear-gradient(to bottom, black 0%, black 28%, transparent 28%, transparent 72%, black 72%, black 100%),
            linear-gradient(to right, black 0%, black 15%, transparent 15%, transparent 85%, black 85%, black 100%)
          `,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in'
        }}
      />
      {/* Overlay using SVG for proper rounded cutout */}
      <svg className="fixed inset-0 w-full h-full z-10 pointer-events-none" preserveAspectRatio="none">
        <defs>
          <mask id="scanner-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect 
              x="15%" 
              y="28%" 
              width="70%" 
              height="44%" 
              rx="24" 
              ry="24" 
              fill="black" 
            />
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.35)" 
          mask="url(#scanner-mask)" 
        />
      </svg>

      <header className="flex items-center justify-between px-4 py-4 relative z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="rounded-full hover:bg-muted/30"
        >
          <ArrowLeft className="h-[25px] w-[25px] text-foreground" strokeWidth={2.5} />
        </Button>
        <Logo size="md" />
        <div className="w-10" />
      </header>

      <div className="py-6 space-y-6 pb-32">
        <div className="text-center px-4 pt-4 relative z-20">
          <p className="text-foreground text-base font-bold leading-tight whitespace-pre-line">
            {t('photoDiagnosticTitle')}
          </p>
        </div>

        {/* Car image with scanner */}
        <div className="w-full relative mt-8">
          <img 
            src={carDiagnosticImage} 
            alt={t('carDiagnosticAlt')} 
            className="w-full h-auto object-contain" 
          />
          
          {/* Scanner overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-[70%] h-[75%]">
              {/* Scanner corners with glow effect */}
              <div 
                className="absolute -top-1 -left-1 w-12 h-12 border-t-[5px] border-l-[5px] border-primary rounded-tl-2xl animate-pulse" 
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
              />
              <div 
                className="absolute -top-1 -right-1 w-12 h-12 border-t-[5px] border-r-[5px] border-primary rounded-tr-2xl animate-pulse" 
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
              />
              <div 
                className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[5px] border-l-[5px] border-primary rounded-bl-2xl animate-pulse" 
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[5px] border-r-[5px] border-primary rounded-br-2xl animate-pulse" 
                style={{ filter: 'drop-shadow(0 0 8px hsl(var(--primary)))' }}
              />
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                  style={{
                    animation: 'scan 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 6px hsl(var(--primary)))',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Camera button - above overlay */}
        <div className="px-4 space-y-4 pt-4 relative z-20">
          <label className="flex flex-col items-center justify-center min-h-[120px] cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleImageCapture} 
              className="hidden" 
            />
            <Camera className="h-16 w-16 text-primary mb-2" />
            <div className="bg-primary hover:bg-primary/90 px-6 py-3 rounded-full transition-colors">
              <p className="text-sm font-semibold text-primary-foreground">Открыть камеру</p>
            </div>
          </label>

          {/* History button */}
          {reports.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowHistory(true)}
            >
              <History className="h-4 w-4 mr-2" />
              История отчётов ({reports.length})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoDiagnostic;
