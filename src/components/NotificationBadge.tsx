import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const NotificationBadge = ({ count, className, size = 'md' }: NotificationBadgeProps) => {
  if (count === 0) return null;

  const sizeClasses = {
    sm: 'h-4 w-4 text-[10px]',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm'
  };

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 rounded-full bg-destructive text-destructive-foreground font-bold flex items-center justify-center shadow-md",
        sizeClasses[size],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;
