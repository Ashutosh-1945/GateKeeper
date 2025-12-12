import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/* ===========================================================================
   DUAL-UNIVERSE BUTTONS
   ===========================================================================
   
   LIGHT MODE (Retro 3D Pill):
   - Cream colored with 3D depth effect
   - Pill shape (border-radius: 7mm)
   - Press animation with depth illusion
   
   UPSIDE DOWN (Dark Mode):
   - Glowing red borders
   - Pulsing effects
   - Organic feel
   =========================================================================== */

export interface StrangerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
}

export const StrangerButton = React.forwardRef<HTMLButtonElement, StrangerButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      fullWidth = false,
      asChild = false,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isUpsideDown } = useTheme();

    const sizeClasses = {
      sm: "min-w-[100px] h-[40px] text-sm",
      md: "min-w-[140px] h-[50px] text-base",
      lg: "min-w-[180px] h-[60px] text-lg",
      icon: "w-[50px] h-[50px]",
    };

    // Dark Mode - Hawkins Lab 3D Brutalist Style
    if (isUpsideDown) {
      const darkVariantClasses = {
        default: "",
        secondary: "btn-hawkins-secondary",
        danger: "",
        ghost: "",
      };

      // Ghost variant stays simple
      if (variant === "ghost") {
        return (
          <Comp
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "font-['Courier_Prime'] font-bold uppercase tracking-widest text-sm",
              "text-gray-400 hover:text-[#E71D36] transition-colors",
              "px-4 py-2",
              fullWidth && "w-full",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingText || "PROCESSING..."}
              </>
            ) : (
              children
            )}
          </Comp>
        );
      }

      // 3D Brutalist Button for dark mode
      return (
        <div
          className={cn(
            "btn-hawkins",
            sizeClasses[size],
            fullWidth && "w-full",
            darkVariantClasses[variant],
            (disabled || isLoading) && "opacity-50 pointer-events-none",
            className
          )}
        >
          <div className="btn-hawkins-shadow" />
          <div className="btn-hawkins-depth" />
          <button
            ref={ref}
            disabled={disabled || isLoading}
            className="btn-hawkins-top"
            {...props}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingText || "PROCESSING..."}
              </>
            ) : (
              children
            )}
          </button>
        </div>
      );
    }

    // Light Mode - Neo-Brutalist 3D Pill Button
    const variantClasses = {
      default: "",
      secondary: "neo-btn-dark",
      danger: "neo-btn-pink",
      ghost: "",
    };

    return (
      <div
        className={cn(
          "neo-btn",
          sizeClasses[size],
          fullWidth && "w-full",
          variantClasses[variant],
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <div className="neo-btn-shadow" />
        <div className="neo-btn-depth" />
        <button
          ref={ref}
          disabled={disabled || isLoading}
          className="neo-btn-top"
          {...props}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || "Processing..."}
            </>
          ) : (
            children
          )}
        </button>
      </div>
    );
  }
);

StrangerButton.displayName = "StrangerButton";

export default StrangerButton;
