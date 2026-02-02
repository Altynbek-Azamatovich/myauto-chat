import founderPhoto from '@/assets/founder-photo.png';
import mapBg from '@/assets/services/roadside-map-bg.png';

export const RoadsideHelpCover = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#2a2a2a]">
      {/* Map background */}
      <img 
        src={mapBg} 
        alt="Map" 
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Centered avatar with pulsing waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Pulsing waves - green like in roadside help */}
        <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-[pulse-wave_2s_ease-out_infinite]" />
        <div className="absolute w-20 h-20 rounded-full bg-emerald-500/30 animate-[pulse-wave_2s_ease-out_infinite_0.4s]" />
        <div className="absolute w-16 h-16 rounded-full bg-emerald-500/40 animate-[pulse-wave_2s_ease-out_infinite_0.8s]" />
        
        {/* Avatar circle */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg z-10">
          <img 
            src={founderPhoto} 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-wave {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
