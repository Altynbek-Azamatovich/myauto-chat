import { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecordingIndicatorProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStop: () => void;
  onCancel: () => void;
}

export const VoiceRecordingIndicator = ({
  isRecording,
  isProcessing,
  onStop,
  onCancel
}: VoiceRecordingIndicatorProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording && !isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Recording indicator with pulsing rings */}
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-destructive/20",
            isRecording && "animate-ping"
          )} 
          style={{ 
            width: '140px', 
            height: '140px', 
            left: '-30px', 
            top: '-30px' 
          }} />
          
          {/* Middle ring */}
          <div className={cn(
            "absolute rounded-full bg-destructive/30 transition-transform duration-300",
            isRecording ? "scale-100" : "scale-0"
          )} 
          style={{ 
            width: '110px', 
            height: '110px', 
            left: '-15px', 
            top: '-15px' 
          }} />
          
          {/* Main button */}
          <button
            onClick={isRecording ? onStop : undefined}
            disabled={isProcessing}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              isRecording ? "bg-destructive text-destructive-foreground shadow-lg" : "bg-muted",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-3xl font-mono font-bold text-foreground">
            {formatTime(seconds)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {isProcessing ? "Обработка..." : "Говорите..."}
          </p>
        </div>

        {/* Instructions */}
        {isRecording && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Нажмите на микрофон чтобы отправить
            </p>
            
            {/* Cancel button */}
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="text-sm">Отмена</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
