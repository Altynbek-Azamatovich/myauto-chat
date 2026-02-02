import { useState, useRef, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableItemProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

export const SwipeableItem = ({ children, onDelete, className }: SwipeableItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const deleteThreshold = -80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Only allow left swipe (negative values)
    if (diff <= 0) {
      setTranslateX(Math.max(diff, -100));
    } else if (translateX < 0) {
      setTranslateX(Math.min(0, translateX + diff));
      startXRef.current = currentX;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (translateX < deleteThreshold) {
      setTranslateX(-80);
    } else {
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete();
    }, 200);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Delete action background */}
      <div 
        className="absolute inset-y-0 right-0 w-20 bg-destructive flex items-center justify-center rounded-r-2xl"
        onClick={handleDelete}
      >
        <Trash2 className="h-5 w-5 text-destructive-foreground" />
      </div>
      
      {/* Swipeable content */}
      <div
        className={cn(
          "relative bg-background transition-transform duration-200 ease-out",
          isDeleting && "opacity-0 scale-95"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};