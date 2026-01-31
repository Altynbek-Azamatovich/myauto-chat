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
    <div className="w-screen overflow-hidden">
      {/* Car image - slides in from right, full width */}
      <img
        src={carImage}
        alt="Car"
        className={`w-full h-auto transition-all duration-[1.2s] ease-out ${
          isVisible 
            ? "translate-x-0 opacity-100" 
            : "translate-x-full opacity-0"
        }`}
      />
    </div>
  );
};

export default AnimatedCar;
