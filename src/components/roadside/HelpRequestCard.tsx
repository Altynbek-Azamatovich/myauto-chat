import { useState, useRef } from 'react';
import { AlertTriangle, ChevronRight, X, MapPin, Clock, Car } from 'lucide-react';
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
  onCancel?: () => void;
  isCurrentUser: boolean;
}

export const HelpRequestCard = ({ request, onHelp, onClose, onCancel, isCurrentUser }: HelpRequestCardProps) => {
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
  const hasResponder = !!request.responder_id;

  // Build car info string
  const carInfoParts = [
    profile?.car_brand,
    profile?.car_model,
    profile?.car_year,
  ].filter(Boolean);
  const carInfo = carInfoParts.length > 0 ? carInfoParts.join(' ') : null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCurrentUser || hasResponder || isSubmitting) return;
    startXRef.current = e.touches[0].clientX;
    setIsSliding(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSliding || !sliderRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    const maxSlide = sliderRef.current.offsetWidth - 56;
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

  // Handle close - just close info window without cancelling
  const handleCloseInfo = () => {
    onClose();
  };

  // Handle cancel request
  const handleCancelRequest = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden max-w-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="w-8" /> {/* Spacer */}
        <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        <button
          onClick={handleCloseInfo}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="px-4 pb-5 space-y-3">
        {/* User info with car */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-foreground">{displayName}</span>
            {carInfo && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Car className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{carInfo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address and distance/time with labels */}
        {(request.address || request.distance || request.eta) && (
          <div className="bg-muted/50 rounded-xl px-4 py-3 space-y-2">
            {request.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="font-medium text-foreground text-sm">{request.address}</span>
              </div>
            )}
            {(request.distance || request.eta) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {request.eta && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Время: <span className="text-foreground font-medium">{request.eta}</span></span>
                  </div>
                )}
                {request.distance && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Расстояние: <span className="text-foreground font-medium">{request.distance}</span></span>
                  </div>
                )}
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

        {/* Swipe to help slider - rounded track and green circular thumb */}
        {!isCurrentUser && !hasResponder && (
          <div
            ref={sliderRef}
            className="relative h-14 bg-muted rounded-full overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Track fill */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/20 rounded-full transition-all duration-75"
              style={{ width: `${slideProgress * 100}%` }}
            />
            
            {/* Slider thumb - green circle */}
            <div
              className="absolute top-1 bottom-1 left-1 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transition-transform"
              style={{ transform: `translateX(${slideProgress * (sliderRef.current ? sliderRef.current.offsetWidth - 56 : 0)}px)` }}
            >
              <ChevronRight className="h-6 w-6 text-primary-foreground" />
            </div>
            
            {/* Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`font-semibold text-sm ${slideProgress > 0.3 ? 'text-primary' : 'text-muted-foreground'}`}>
                {isSubmitting ? 'Отправка...' : 'Еду на помощь →'}
              </span>
            </div>
          </div>
        )}

        {hasResponder && !isCurrentUser && (
          <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 rounded-full">
            <span className="font-medium text-primary text-sm">✓ Помощь уже в пути</span>
          </div>
        )}

        {isCurrentUser && (
          <Button
            variant="destructive"
            className="w-full h-12 rounded-full"
            onClick={handleCancelRequest}
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
