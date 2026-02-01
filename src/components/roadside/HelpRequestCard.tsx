import { useState, useRef } from 'react';
import { CheckCircle, AlertTriangle, Car, ChevronRight, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HelpRequestCardProps {
  request: {
    id: string;
    user_id: string;
    message: string;
    address?: string;
    distance?: string;
    eta?: string;
    responder_id?: string | null;
    profiles?: {
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      is_verified?: boolean;
      car_brand: string | null;
      car_model: string | null;
      car_year: number | null;
      engine_volume: string | null;
      fuel_type: string | null;
    } | null;
  };
  onHelp: (requestId: string) => Promise<void>;
  onClose: () => void;
  isCurrentUser: boolean;
}

export const HelpRequestCard = ({ request, onHelp, onClose, isCurrentUser }: HelpRequestCardProps) => {
  const [isSliding, setIsSliding] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const profile = request.profiles;
  const firstName = profile?.first_name || 'Водитель';
  const lastInitial = profile?.last_name ? profile.last_name[0] + '.' : '';
  const displayName = `${firstName} ${lastInitial}`;
  const initials = firstName[0] + (profile?.last_name?.[0] || '');
  const isVerified = profile?.is_verified || false;
  const hasResponder = !!request.responder_id;

  const carInfo = [
    profile?.car_brand,
    profile?.car_model,
    profile?.car_year,
    profile?.engine_volume,
    profile?.fuel_type
  ].filter(Boolean).join(' · ');

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCurrentUser || hasResponder || isSubmitting) return;
    startXRef.current = e.touches[0].clientX;
    setIsSliding(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSliding || !sliderRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    const maxSlide = sliderRef.current.offsetWidth - 64;
    const progress = Math.min(Math.max(diff / maxSlide, 0), 1);
    setSlideProgress(progress);
  };

  const handleTouchEnd = async () => {
    if (!isSliding) return;
    setIsSliding(false);
    
    if (slideProgress >= 0.8) {
      setIsSubmitting(true);
      try {
        await onHelp(request.id);
      } finally {
        setIsSubmitting(false);
        setSlideProgress(0);
      }
    } else {
      setSlideProgress(0);
    }
  };

  return (
    <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 overflow-hidden">
      {/* Close button */}
      <div className="flex justify-center pt-3 pb-2">
        <button
          onClick={onClose}
          className="w-12 h-1.5 bg-muted-foreground/20 rounded-full hover:bg-muted-foreground/40 transition-colors"
        />
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* User info */}
        <div className="flex items-center gap-3">
          {hasResponder && (
            <div className="absolute -ml-1 -mt-6">
              <CheckCircle className="h-5 w-5 text-primary fill-primary" />
            </div>
          )}
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isVerified && (
                <CheckCircle className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
              )}
              <span className="font-semibold text-foreground">{displayName}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isVerified ? 'Профиль подтверждён' : 'Профиль не подтверждён'}
            </div>
            {carInfo && (
              <div className="text-sm text-muted-foreground mt-0.5 truncate">
                {carInfo}
              </div>
            )}
          </div>
        </div>

        {/* Address and distance */}
        {(request.address || request.distance || request.eta) && (
          <div className="bg-muted/50 rounded-xl px-4 py-3">
            {request.address && (
              <div className="font-medium text-foreground">{request.address}</div>
            )}
            {(request.distance || request.eta) && (
              <div className="text-sm text-muted-foreground mt-1">
                {[request.eta, request.distance].filter(Boolean).join(' | ')}
              </div>
            )}
          </div>
        )}

        {/* Problem description */}
        <div className="flex items-start gap-3 bg-destructive/5 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">
            {request.message}
          </p>
        </div>

        {/* Action button */}
        {!isCurrentUser && !hasResponder && (
          <div
            ref={sliderRef}
            className="relative h-14 bg-muted rounded-2xl overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Track fill */}
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-75"
              style={{ width: `${slideProgress * 100}%` }}
            />
            
            {/* Slider thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-12 w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg transition-transform"
              style={{ left: `${slideProgress * (100 - 15)}%`, transform: 'translateY(-50%)' }}
            >
              <ChevronRight className="h-6 w-6 text-primary-foreground" />
            </div>
            
            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`font-semibold ${slideProgress > 0.3 ? 'text-primary-foreground' : 'text-foreground'}`}>
                {isSubmitting ? 'Отправка...' : 'Еду на помощь'}
              </span>
            </div>
          </div>
        )}

        {hasResponder && !isCurrentUser && (
          <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 rounded-2xl">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">Помощь уже в пути</span>
          </div>
        )}

        {isCurrentUser && (
          <Button
            variant="destructive"
            className="w-full h-12 rounded-xl"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-2" />
            Отменить запрос
          </Button>
        )}
      </div>
    </div>
  );
};

export default HelpRequestCard;
