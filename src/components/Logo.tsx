import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      className={cn(
        "font-logo font-bold tracking-tight",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-primary">my</span>
      <span className="text-foreground">auto</span>
    </span>
  );
};

export default Logo;