// Car brand logos - using brand initials as styled badges for now
// Row 1: 10 brands
const row1Brands = [
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Mercedes', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { name: 'Honda', logo: 'https://www.carlogos.org/car-logos/honda-logo.png' },
  { name: 'Lexus', logo: 'https://www.carlogos.org/car-logos/lexus-logo.png' },
  { name: 'Porsche', logo: 'https://www.carlogos.org/car-logos/porsche-logo.png' },
  { name: 'Mazda', logo: 'https://www.carlogos.org/car-logos/mazda-logo.png' },
  { name: 'Nissan', logo: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
  { name: 'Subaru', logo: 'https://www.carlogos.org/car-logos/subaru-logo.png' },
];

// Row 2: 10 different brands
const row2Brands = [
  { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { name: 'Chevrolet', logo: 'https://www.carlogos.org/car-logos/chevrolet-logo.png' },
  { name: 'Hyundai', logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
  { name: 'Kia', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
  { name: 'Volvo', logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
  { name: 'Jaguar', logo: 'https://www.carlogos.org/car-logos/jaguar-logo.png' },
  { name: 'Land Rover', logo: 'https://www.carlogos.org/car-logos/land-rover-logo.png' },
  { name: 'Mitsubishi', logo: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png' },
  { name: 'Infiniti', logo: 'https://www.carlogos.org/car-logos/infiniti-logo.png' },
];

// Row 3: 10 different brands
const row3Brands = [
  { name: 'Ferrari', logo: 'https://www.carlogos.org/car-logos/ferrari-logo.png' },
  { name: 'Lamborghini', logo: 'https://www.carlogos.org/car-logos/lamborghini-logo.png' },
  { name: 'Bentley', logo: 'https://www.carlogos.org/car-logos/bentley-logo.png' },
  { name: 'Maserati', logo: 'https://www.carlogos.org/car-logos/maserati-logo.png' },
  { name: 'Rolls Royce', logo: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png' },
  { name: 'Aston Martin', logo: 'https://www.carlogos.org/car-logos/aston-martin-logo.png' },
  { name: 'McLaren', logo: 'https://www.carlogos.org/car-logos/mclaren-logo.png' },
  { name: 'Bugatti', logo: 'https://www.carlogos.org/car-logos/bugatti-logo.png' },
  { name: 'Alfa Romeo', logo: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png' },
  { name: 'Cadillac', logo: 'https://www.carlogos.org/car-logos/cadillac-logo.png' },
];

interface MarqueeRowProps {
  brands: { name: string; logo: string }[];
  direction: 'ltr' | 'rtl';
}

const MarqueeRow = ({ brands, direction }: MarqueeRowProps) => {
  const animationName = direction === 'ltr' ? 'ping-pong-ltr' : 'ping-pong-rtl';
  
  return (
    <div 
      className="flex items-center justify-start gap-3 px-2"
      style={{
        animation: `${animationName} 8s ease-in-out infinite`,
      }}
    >
      {brands.map((brand, idx) => (
        <div 
          key={idx} 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/90 p-1.5 shadow-sm flex items-center justify-center"
        >
          <img 
            src={brand.logo} 
            alt={brand.name}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

export const AutoForumMarquee = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80">
      {/* Rows container - positioned lower */}
      <div className="absolute inset-x-0 top-[35%] flex flex-col gap-2 opacity-90">
        {/* Row 1 - left to right */}
        <div className="overflow-hidden">
          <MarqueeRow brands={row1Brands} direction="ltr" />
        </div>
        {/* Row 2 - right to left */}
        <div className="overflow-hidden">
          <MarqueeRow brands={row2Brands} direction="rtl" />
        </div>
        {/* Row 3 - left to right */}
        <div className="overflow-hidden">
          <MarqueeRow brands={row3Brands} direction="ltr" />
        </div>
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      
      <style>{`
        @keyframes ping-pong-ltr {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(calc(-100% + 100vw / 2 - 16px)); }
        }
        @keyframes ping-pong-rtl {
          0%, 100% { transform: translateX(calc(-100% + 100vw / 2 - 16px)); }
          50% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
