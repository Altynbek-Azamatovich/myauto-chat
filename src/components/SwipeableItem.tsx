import { useState, useRef, ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableItemProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

export const SwipeableItem = ({ children, onDelete, className }: SwipeableItemProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow swipe left (positive diff)
    if (diff > 0) {
      setTranslateX(Math.min(diff, 80));
    } else {
      setTranslateX(Math.max(diff, 0));
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    // If swiped more than 40px, show delete button
    if (translateX > 40) {
      setTranslateX(80);
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

  const handleClose = () => {
    setTranslateX(0);
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all",
        isDeleting && "opacity-0 scale-95",
        className
      )}
    >
      {/* Delete button background */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-20 bg-destructive flex items-center justify-center rounded-r-2xl cursor-pointer"
        onClick={handleDelete}
      >
        <Trash2 className="h-6 w-6 text-destructive-foreground" />
      </div>
      
      {/* Main content */}
      <div
        className="relative bg-card transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => translateX > 0 && handleClose()}
      >
        {children}
      </div>
    </div>
  );
};
