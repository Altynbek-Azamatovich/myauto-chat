import { useEffect, useRef } from 'react';

const carBrands = [
  'Toyota', 'BMW', 'Mercedes', 'Audi', 'Honda', 'Lexus', 'Porsche', 'Ferrari',
  'Lamborghini', 'Mazda', 'Nissan', 'Hyundai', 'Kia', 'Volkswagen', 'Ford',
  'Chevrolet', 'Subaru', 'Mitsubishi', 'Volvo', 'Jaguar', 'Land Rover', 'Bentley'
];

const MarqueeRow = ({ direction = 'left', offset = 0 }: { direction?: 'left' | 'right'; offset?: number }) => {
  const brands = [...carBrands, ...carBrands, ...carBrands]; // Triple for seamless loop
  
  return (
    <div 
      className="flex whitespace-nowrap"
      style={{
        animation: `marquee-${direction} 20s linear infinite`,
        animationDelay: `${offset}s`
      }}
    >
      {brands.map((brand, idx) => (
        <span 
          key={idx} 
          className="inline-block px-3 py-1 text-xs font-semibold text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          {brand}
        </span>
      ))}
    </div>
  );
};

export const AutoForumMarquee = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80">
      <div className="absolute inset-0 flex flex-col justify-center gap-1 opacity-80">
        {/* Row 1 - left */}
        <div className="overflow-hidden">
          <MarqueeRow direction="left" offset={0} />
        </div>
        {/* Row 2 - right (staggered) */}
        <div className="overflow-hidden pl-8">
          <MarqueeRow direction="right" offset={-5} />
        </div>
        {/* Row 3 - left */}
        <div className="overflow-hidden">
          <MarqueeRow direction="left" offset={-10} />
        </div>
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
