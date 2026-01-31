import { useEffect, useState } from "react";

interface AnimatedCarProps {
  onAnimationComplete?: () => void;
}

export const AnimatedCar = ({ onAnimationComplete }: AnimatedCarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Notify when animation completes
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="relative w-64 h-32 overflow-visible">
      {/* Road line */}
      <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-muted-foreground/20" />
      
      {/* Car SVG */}
      <svg
        viewBox="0 0 200 80"
        className={`w-full h-full transition-all duration-[1.5s] ease-out ${
          isVisible 
            ? "translate-x-0 opacity-100" 
            : "-translate-x-full opacity-0"
        }`}
        style={{
          filter: "drop-shadow(0 4px 12px hsl(var(--foreground) / 0.1))"
        }}
      >
        {/* Car Body - Minimalist sedan silhouette */}
        <g className="car-body">
          {/* Main body */}
          <path
            d="M20 50 L35 50 L45 35 L75 30 L130 30 L155 35 L170 50 L180 50 L180 55 L175 60 L25 60 L20 55 Z"
            fill="hsl(var(--foreground))"
            className="transition-all duration-300"
          />
          
          {/* Roof/Cabin */}
          <path
            d="M55 35 L65 20 L120 20 L140 35 Z"
            fill="hsl(var(--foreground))"
            opacity="0.9"
          />
          
          {/* Windows */}
          <path
            d="M62 33 L70 22 L95 22 L95 33 Z"
            fill="hsl(var(--background))"
            opacity="0.6"
          />
          <path
            d="M100 22 L100 33 L130 33 L122 22 Z"
            fill="hsl(var(--background))"
            opacity="0.6"
          />
          
          {/* Headlight */}
          <ellipse
            cx="168"
            cy="45"
            rx="4"
            ry="3"
            fill="hsl(var(--primary))"
            opacity="0.9"
          />
          
          {/* Taillight */}
          <rect
            x="22"
            y="43"
            width="6"
            height="4"
            rx="1"
            fill="hsl(var(--destructive))"
            opacity="0.7"
          />
        </g>
        
        {/* Wheels */}
        <g className="wheels">
          {/* Front wheel */}
          <circle
            cx="145"
            cy="60"
            r="12"
            fill="hsl(var(--foreground))"
          />
          <circle
            cx="145"
            cy="60"
            r="7"
            fill="hsl(var(--muted))"
          />
          <circle
            cx="145"
            cy="60"
            r="3"
            fill="hsl(var(--foreground))"
          />
          
          {/* Rear wheel */}
          <circle
            cx="55"
            cy="60"
            r="12"
            fill="hsl(var(--foreground))"
          />
          <circle
            cx="55"
            cy="60"
            r="7"
            fill="hsl(var(--muted))"
          />
          <circle
            cx="55"
            cy="60"
            r="3"
            fill="hsl(var(--foreground))"
          />
        </g>
      </svg>
      
      {/* Motion trails */}
      <div
        className={`absolute bottom-[26px] left-0 h-[1px] bg-gradient-to-r from-muted-foreground/40 to-transparent transition-all duration-[1.2s] ease-out ${
          isVisible ? "w-0 opacity-0" : "w-16 opacity-100"
        }`}
        style={{ transitionDelay: "0.3s" }}
      />
      <div
        className={`absolute bottom-[30px] left-4 h-[1px] bg-gradient-to-r from-muted-foreground/30 to-transparent transition-all duration-[1s] ease-out ${
          isVisible ? "w-0 opacity-0" : "w-12 opacity-100"
        }`}
        style={{ transitionDelay: "0.4s" }}
      />
    </div>
  );
};

export default AnimatedCar;
