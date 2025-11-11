import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RatingReviewProps {
  partnerId: string;
  orderId?: string;
  onReviewSubmitted?: () => void;
}

const RatingReview = ({ partnerId, orderId, onReviewSubmitted }: RatingReviewProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Пожалуйста, поставьте оценку');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const { error } = await supabase.from('reviews').insert({
        user_id: user.id,
        partner_id: partnerId,
        order_id: orderId,
        rating,
        comment: comment.trim() || null,
      }) as any;

      if (error) throw error;

      toast.success('Спасибо за ваш отзыв!');
      setOpen(false);
      setRating(0);
      setComment('');
      onReviewSubmitted?.();
    } catch (error: any) {
      console.error('Review submission error:', error);
      toast.error(error.message || 'Ошибка отправки отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Оставить отзыв
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оценить услугу</DialogTitle>
            <DialogDescription>
              Поделитесь своим опытом с другими пользователями
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoveredRating || rating) >= value
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Комментарий (необязательно)
              </label>
              <Textarea
                placeholder="Расскажите подробнее о вашем опыте..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="w-full"
            >
              {submitting ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RatingReview;
