import { useTheme } from "@/context/ThemeContext";

/**
 * Hawkins Lab Visual Effects
 * - GrainOverlay: CRT film grain texture
 * - Spores: Floating red particles (Upside Down atmosphere)
 * - MarqueeScanner: Scrolling warning marquee
 */

// Film Grain Overlay - CRT/VHS aesthetic
export const GrainOverlay = () => {
  const { isUpsideDown } = useTheme();
  
  if (!isUpsideDown) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.07] mix-blend-overlay">
      <div 
        className="w-full h-full" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

// Floating Spores - Upside Down particles
export const Spores = ({ count = 15 }: { count?: number }) => {
  const { isUpsideDown } = useTheme();
  
  if (!isUpsideDown) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[#E71D36]/30 blur-[2px]"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `spore-float ${Math.random() * 15 + 10}s linear infinite`,
            animationDelay: `-${Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
};

// Warning Marquee Scanner
export const MarqueeScanner = ({ 
  text = "HAWKINS LAB // BREACH DETECTED // CODE RED",
  repeat = 8 
}: { 
  text?: string;
  repeat?: number;
}) => {
  const { isUpsideDown } = useTheme();
  
  if (!isUpsideDown) return null;
  
  return (
    <div className="w-full bg-black border-y-4 border-[#E71D36] py-3 overflow-hidden whitespace-nowrap relative">
      <div className="absolute inset-0 bg-[#E71D36]/10 animate-pulse" />
      <div className="inline-block animate-marquee relative z-10">
        {[...Array(repeat)].map((_, i) => (
          <span 
            key={i} 
            className="mx-8 font-['Merriweather'] font-black text-xl text-[#E71D36] uppercase tracking-widest inline-flex items-center gap-4"
            style={{ textShadow: '2px 2px 0px #000' }}
          >
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

// CRT Scanlines effect wrapper
export const ScanlineOverlay = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const { isUpsideDown } = useTheme();
  
  return (
    <div className={`relative ${className}`}>
      {children}
      {isUpsideDown && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%),
                        linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))`,
            backgroundSize: '100% 4px, 6px 100%'
          }}
        />
      )}
    </div>
  );
};

// Combined Hawkins Effects Provider
export const HawkinsEffects = ({ sporeCount = 15 }: { sporeCount?: number }) => {
  const { isUpsideDown } = useTheme();
  
  if (!isUpsideDown) return null;
  
  return (
    <>
      <GrainOverlay />
      <Spores count={sporeCount} />
    </>
  );
};

export default HawkinsEffects;
