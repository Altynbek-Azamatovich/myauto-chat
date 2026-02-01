import { useState } from 'react';
import { MapPin, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string, sharePhone: boolean) => Promise<void>;
}

export const CreateRequestDialog = ({ open, onOpenChange, onSubmit }: CreateRequestDialogProps) => {
  const [message, setMessage] = useState('');
  const [sharePhone, setSharePhone] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim(), sharePhone);
      setMessage('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1002] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog content - bottom sheet style with safe margins */}
      <div className="relative bg-card rounded-t-3xl w-full max-w-md mx-4 mb-0 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        {/* Handle + close button */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="w-8" />
          <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Header */}
        <div className="px-5 pb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Запрос о помощи
          </h2>
        </div>
        
        {/* Content */}
        <div className="px-5 pb-8 space-y-4">
          <Textarea
            placeholder="Опишите вашу проблему (например: спустило колесо, села батарея, закончился бензин...)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none rounded-xl text-base"
          />

          {/* Share phone checkbox */}
          <div className="flex items-center gap-3 py-2">
            <Checkbox 
              id="sharePhone" 
              checked={sharePhone} 
              onCheckedChange={(checked) => setSharePhone(!!checked)} 
            />
            <Label htmlFor="sharePhone" className="text-sm text-muted-foreground cursor-pointer">
              Делиться номером телефона для звонка
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="w-full h-12 rounded-xl text-base bg-destructive hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Создание запроса...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-5 w-5" />
                Отправить SOS
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestDialog;
