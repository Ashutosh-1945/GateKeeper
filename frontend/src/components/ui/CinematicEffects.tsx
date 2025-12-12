import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";

/* ===========================================================================
   DUAL-UNIVERSE CINEMATIC EFFECTS
   ===========================================================================
   
   LIGHT MODE (Retro):
   - Clean, no floating shapes
   - Simple solid background
   
   UPSIDE DOWN (Dark Mode):
   - Floating ash/spore particles
   - Red atmospheric tint
   - Portal edge glow
   =========================================================================== */

/**
 * Light Mode Background - Clean and simple
 */
export const MemphisBackground = () => {
  const { isUpsideDown } = useTheme();

  // No floating shapes in light mode for this theme
  if (!isUpsideDown) return null;

  return null;
};

/**
 * UPSIDE DOWN ATMOSPHERE (Dark Mode)
 */
export const AtmosphereTint = () => {
  const { isUpsideDown } = useTheme();

  if (!isUpsideDown) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9990]"
      style={{
        background: "linear-gradient(180deg, rgba(5,5,5,0.3) 0%, rgba(20,5,10,0.5) 100%)",
        mixBlendMode: "multiply",
      }}
      aria-hidden="true"
    />
  );
};

/**
 * FLOATING ASH PARTICLES (Dark Mode)
 */
export const FloatingAsh = ({ count = 20 }: { count?: number }) => {
  const { isUpsideDown } = useTheme();
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    size: number;
    delay: number;
    duration: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    if (isUpsideDown) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100 + "%",
        size: Math.random() * 3 + 1,
        delay: Math.random() * 30,
        duration: Math.random() * 20 + 15,
        opacity: Math.random() * 0.4 + 0.2,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isUpsideDown, count]);

  if (!isUpsideDown) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9992] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: `rgba(231, 29, 54, ${p.opacity * 0.6})`,
            filter: "blur(0.5px)",
            animation: `float ${p.duration}s linear infinite`,
            animationDelay: `-${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * PORTAL EDGE GLOW (Dark Mode)
 */
export const PortalGlow = () => {
  const { isUpsideDown } = useTheme();

  if (!isUpsideDown) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9993]"
      style={{
        boxShadow: "inset 0 0 100px rgba(231,29,54,0.1), inset 0 0 200px rgba(231,29,54,0.05)",
      }}
      aria-hidden="true"
    />
  );
};

/**
 * COMBINED CINEMATIC OVERLAY
 */
export const CinematicOverlay = ({
  enableParticles = true,
  enableAtmosphere = true,
  particleCount = 25,
}: {
  enableParticles?: boolean;
  enableAtmosphere?: boolean;
  particleCount?: number;
}) => {
  return (
    <>
      <MemphisBackground />
      {enableAtmosphere && <AtmosphereTint />}
      {enableParticles && <FloatingAsh count={particleCount} />}
      <PortalGlow />
    </>
  );
};

export default CinematicOverlay;
