import { useEffect, useState, useRef } from "react";
import carImage from "@/assets/car-covered-new.png";

interface AnimatedCarProps {
  onAnimationComplete?: () => void;
}

export const AnimatedCar = ({ onAnimationComplete }: AnimatedCarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reset animation state when component mounts
    setIsVisible(false);
    hasAnimated.current = false;

    // Start car animation after a brief delay
    const carTimer = setTimeout(() => {
      if (!hasAnimated.current) {
        setIsVisible(true);
        hasAnimated.current = true;
      }
    }, 100);

    // Notify when animation completes
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2500);

    return () => {
      clearTimeout(carTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="w-full overflow-hidden">
      {/* Car image - slides in from right, full width */}
      <img
        src={carImage}
        alt="Car"
        style={{
          width: '100%',
          height: 'auto',
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 2s ease-out, opacity 0.5s ease-out',
          willChange: 'transform, opacity',
        }}
      />
    </div>
  );
};

export default AnimatedCar;
