import { useEffect, useState } from "react";
import carImage from "@/assets/car-covered-new.png";

interface AnimatedCarProps {
  onAnimationComplete?: () => void;
}

export const AnimatedCar = ({ onAnimationComplete }: AnimatedCarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showBeam, setShowBeam] = useState(false);

  useEffect(() => {
    // Start car animation after a brief delay
    const carTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Show light beam after car arrives
    const beamTimer = setTimeout(() => {
      setShowBeam(true);
    }, 1200);

    // Notify when animation completes
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);

    return () => {
      clearTimeout(carTimer);
      clearTimeout(beamTimer);
      clearTimeout(completeTimer);
    };
  }, [onAnimationComplete]);

  return (
    <div className="relative w-full h-48 overflow-hidden">
      {/* Light beam from headlights */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-l from-white via-white/80 to-transparent transition-all duration-1000 ease-out ${
          showBeam ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
        style={{
          boxShadow: showBeam ? "0 0 20px 4px rgba(255, 255, 255, 0.5), 0 0 40px 8px rgba(255, 255, 255, 0.3)" : "none",
        }}
      />
      
      {/* Car image */}
      <img
        src={carImage}
        alt="Car"
        className={`absolute right-0 top-1/2 -translate-y-1/2 h-40 w-auto object-contain transition-all duration-[1.2s] ease-out ${
          isVisible 
            ? "translate-x-[50%] opacity-100" 
            : "translate-x-[150%] opacity-0"
        }`}
        style={{
          filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))"
        }}
      />
    </div>
  );
};

export default AnimatedCar;
