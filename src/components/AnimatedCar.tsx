import { useEffect, useState } from "react";
import carImage from "@/assets/car-covered-new.png";

interface AnimatedCarProps {
  onAnimationComplete?: () => void;
}

export const AnimatedCar = ({ onAnimationComplete }: AnimatedCarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start car animation after a brief delay
    const carTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Notify when animation completes
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 1500);

    return () => {
      clearTimeout(carTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Car image - slides in from right */}
      <img
        src={carImage}
        alt="Car"
        className={`w-full h-auto object-contain transition-all duration-[1.2s] ease-out ${
          isVisible 
            ? "translate-x-0 opacity-100" 
            : "translate-x-full opacity-0"
        }`}
        style={{
          filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))"
        }}
      />
    </div>
  );
};

export default AnimatedCar;
