import { useTheme } from "@/context/ThemeContext";
import { useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * DUAL-UNIVERSE THEME TOGGLE
 * Light Mode (Retro) <-> Upside Down (Dark)
 */
export const ThemeToggle = ({ className = "", showLabel = false }: ThemeToggleProps) => {
  const { toggleTheme, isUpsideDown } = useTheme();
  const [isFlickering, setIsFlickering] = useState(false);

  const handleToggle = useCallback(() => {
    setIsFlickering(true);
    
    setTimeout(() => {
      toggleTheme();
      setTimeout(() => {
        setIsFlickering(false);
      }, 300);
    }, 200);
  }, [toggleTheme]);

  return (
    <button
      onClick={handleToggle}
      className={`
        relative group flex items-center gap-3 px-4 py-2
        transition-all duration-300 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isUpsideDown 
          ? "bg-black border-2 border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36] hover:shadow-[6px_6px_0px_0px_#E71D36] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_#E71D36] active:translate-x-[2px] active:translate-y-[2px] focus-visible:ring-[#E71D36]" 
          : "bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-[7mm] shadow-[4px_4px_0px_0px_var(--color-neo-gray)] hover:shadow-[6px_6px_0px_0px_var(--color-neo-gray)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_var(--color-neo-gray)] active:translate-x-[2px] active:translate-y-[2px]"
        }
        ${isFlickering ? "animate-pulse" : ""}
        ${className}
      `}
      aria-label={`Switch to ${isUpsideDown ? "Light" : "Dark"} mode`}
      title={isUpsideDown ? "Switch to Light Mode" : "Enter the Upside Down"}
    >
      {isUpsideDown ? (
        <Sun className="w-5 h-5 text-[#E71D36]" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--color-neo-black)]" />
      )}

      {showLabel && (
        <span className={`
          text-sm font-medium font-['Courier_Prime']
          ${isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-black)]"}
        `}>
          {isUpsideDown ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
};

/**
 * COMPACT THEME TOGGLE - Icon only version
 */
export const ThemeToggleCompact = ({ className = "" }: { className?: string }) => {
  const { toggleTheme, isUpsideDown } = useTheme();
  const [isFlickering, setIsFlickering] = useState(false);

  const handleToggle = useCallback(() => {
    setIsFlickering(true);
    
    setTimeout(() => {
      toggleTheme();
      setTimeout(() => {
        setIsFlickering(false);
      }, 300);
    }, 200);
  }, [toggleTheme]);

  return (
    <button
      onClick={handleToggle}
      className={`
        w-10 h-10 flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${isUpsideDown 
          ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] hover:shadow-[4px_4px_0px_0px_#E71D36] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_0px_#E71D36] active:translate-x-[1px] active:translate-y-[1px] text-[#E71D36]" 
          : "bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-[5mm] shadow-[3px_3px_0px_0px_var(--color-neo-gray)] hover:shadow-[4px_4px_0px_0px_var(--color-neo-gray)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:shadow-[1px_1px_0px_0px_var(--color-neo-gray)] active:translate-x-[1px] active:translate-y-[1px]"
        }
        ${isFlickering ? "animate-pulse" : ""}
        ${className}
      `}
      aria-label={`Switch to ${isUpsideDown ? "Light" : "Dark"} mode`}
    >
      {isUpsideDown ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5 text-[var(--color-neo-black)]" />
      )}
    </button>
  );
};

export default ThemeToggle;
