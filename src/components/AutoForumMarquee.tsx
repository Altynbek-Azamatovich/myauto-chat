// Row 1: 20 brands
const row1Brands = [
  'toyota', 'bmw', 'mercedes-benz', 'audi', 'honda', 'lexus', 'porsche', 'mazda', 'nissan', 'subaru',
  'suzuki', 'acura', 'genesis', 'lincoln', 'buick', 'chrysler', 'dodge', 'jeep', 'ram', 'gmc'
];

// Row 2: 20 different brands
const row2Brands = [
  'volkswagen', 'ford', 'chevrolet', 'hyundai', 'kia', 'volvo', 'jaguar', 'land-rover', 'mitsubishi', 'infiniti',
  'peugeot', 'renault', 'citroen', 'fiat', 'seat', 'skoda', 'opel', 'saab', 'dacia', 'lada'
];

// Row 3: 20 different brands  
const row3Brands = [
  'ferrari', 'lamborghini', 'bentley', 'maserati', 'rolls-royce', 'aston-martin', 'mclaren', 'bugatti', 'alfa-romeo', 'cadillac',
  'tesla', 'rivian', 'lucid', 'lotus', 'mini', 'smart', 'maybach', 'koenigsegg', 'pagani', 'rimac'
];

// Row 4: 20 more brands
const row4Brands = [
  'pontiac', 'oldsmobile', 'mercury', 'hummer', 'saturn', 'scion', 'daewoo', 'ssangyong', 'proton', 'perodua',
  'tata', 'mahindra', 'maruti', 'geely', 'byd', 'nio', 'xpeng', 'haval', 'chery', 'great-wall'
];

const getLogoUrl = (brand: string) => {
  return `https://www.carlogos.org/car-logos/${brand}-logo.png`;
};

interface MarqueeRowProps {
  brands: string[];
  direction: 'ltr' | 'rtl';
}

const MarqueeRow = ({ brands, direction }: MarqueeRowProps) => {
  const animationName = direction === 'ltr' ? 'ping-pong-ltr' : 'ping-pong-rtl';
  
  return (
    <div 
      className="flex items-center gap-2"
      style={{
        animation: `${animationName} 12s ease-in-out infinite`,
      }}
    >
      {brands.map((brand, idx) => (
        <div 
          key={idx} 
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
        >
          <img 
            src={getLogoUrl(brand)} 
            alt={brand}
            className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
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
      {/* Rows container - centered vertically */}
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-1 py-3">
        {/* Row 1 - left to right */}
        <div className="overflow-hidden w-full">
          <MarqueeRow brands={row1Brands} direction="ltr" />
        </div>
        {/* Row 2 - right to left */}
        <div className="overflow-hidden w-full">
          <MarqueeRow brands={row2Brands} direction="rtl" />
        </div>
        {/* Row 3 - left to right */}
        <div className="overflow-hidden w-full">
          <MarqueeRow brands={row3Brands} direction="ltr" />
        </div>
        {/* Row 4 - right to left */}
        <div className="overflow-hidden w-full">
          <MarqueeRow brands={row4Brands} direction="rtl" />
        </div>
      </div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
      
      <style>{`
        @keyframes ping-pong-ltr {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(calc(-100% + 150px)); }
        }
        @keyframes ping-pong-rtl {
          0%, 100% { transform: translateX(calc(-100% + 150px)); }
          50% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
