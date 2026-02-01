import { useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<void>;
}

export const CreateRequestDialog = ({ open, onOpenChange, onSubmit }: CreateRequestDialogProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
      setMessage('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Запрос о помощи
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="Опишите вашу проблему (например: спустило колесо, села батарея, закончился бензин...)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none rounded-xl"
          />
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
