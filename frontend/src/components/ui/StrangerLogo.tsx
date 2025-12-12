import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════════════
   STRANGER THINGS LOGO COMPONENT
   ═══════════════════════════════════════════════════════════════════════════
   
   Dark Mode: Classic Stranger Things glowing red logo
   Light Mode: Clean retro text style
   ═══════════════════════════════════════════════════════════════════════════ */

interface StrangerLogoProps {
  topText?: string;
  bottomText?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const StrangerLogo = ({
  topText = "Stranger",
  bottomText = "Things",
  className,
  size = "lg",
}: StrangerLogoProps) => {
  const { isUpsideDown } = useTheme();

  const sizeClasses = {
    sm: { top: "text-2xl", bottom: "text-xl" },
    md: { top: "text-3xl md:text-4xl", bottom: "text-2xl md:text-3xl" },
    lg: { top: "text-4xl md:text-5xl lg:text-6xl", bottom: "text-3xl md:text-4xl lg:text-5xl" },
    xl: { top: "text-5xl md:text-6xl lg:text-7xl", bottom: "text-4xl md:text-5xl lg:text-6xl" },
  };

  if (isUpsideDown) {
    return (
      <div className={cn("st-logo", className)}>
        <div className="st-top">
          <div className="st-bound st-bound-full" />
          <p className={sizeClasses[size].top}>
            {topText.split("").map((char, i) => (
              <span
                key={i}
                className={cn(
                  i === 0 || i === topText.length - 1 ? "st-drop" : ""
                )}
              >
                {char}
              </span>
            ))}
          </p>
          <div className="st-bound st-bound-mini st-bound-left" />
          <div className="st-bound st-bound-mini st-bound-right" />
        </div>
        <div className="st-bottom">
          <p className={sizeClasses[size].bottom}>
            {bottomText.split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </p>
        </div>
      </div>
    );
  }

  // Light Mode - Clean retro style
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <h1
        className={cn(
          "font-bold tracking-tight",
          sizeClasses[size].top,
          "text-[var(--color-cream-text)]"
        )}
        style={{ fontFamily: "var(--font-header)" }}
      >
        {topText}
      </h1>
      <h2
        className={cn(
          "font-semibold tracking-[0.3em] uppercase",
          sizeClasses[size].bottom,
          "text-[var(--color-cream-light)]"
        )}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {bottomText}
      </h2>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   GATEKEEPER LOGO
   ═══════════════════════════════════════════════════════════════════════════ */

interface GateKeeperLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const GateKeeperLogo = ({ className, size = "lg" }: GateKeeperLogoProps) => {
  return (
    <StrangerLogo
      topText="Gate"
      bottomText="Keeper"
      className={className}
      size={size}
    />
  );
};

export default StrangerLogo;
