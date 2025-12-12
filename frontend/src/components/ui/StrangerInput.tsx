import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { Eye, EyeOff, Search, Terminal } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   STRANGER THINGS INPUTS
   ═══════════════════════════════════════════════════════════════════════════
   Dark Mode: Green-screen terminal style with blinking cursor
   Light Mode: Retro government form fields
   ═══════════════════════════════════════════════════════════════════════════ */

interface StrangerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "terminal" | "search" | "password";
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const StrangerInput = React.forwardRef<HTMLInputElement, StrangerInputProps>(
  (
    {
      className,
      variant = "default",
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      type = "text",
      ...props
    },
    ref
  ) => {
    const { isUpsideDown } = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = variant === "password" || type === "password";
    const isSearch = variant === "search";
    const isTerminal = variant === "terminal";

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-mono uppercase tracking-wider mb-2",
              isUpsideDown ? "text-gate-red" : "text-lab-slate",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {(leftIcon || isSearch || isTerminal) && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                isUpsideDown ? "text-gate-red/60" : "text-lab-slate/60"
              )}
            >
              {leftIcon || (isSearch && <Search className="w-4 h-4" />) || (isTerminal && <Terminal className="w-4 h-4 text-terminal-green" />)}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full px-4 py-3 rounded-lg font-mono text-sm",
              "transition-all duration-300",
              "focus:outline-none focus:ring-2",
              "placeholder:opacity-50",
              
              // Left padding for icon
              (leftIcon || isSearch || isTerminal) && "pl-10",
              
              // Right padding for password toggle
              (rightIcon || isPassword) && "pr-10",

              // Theme-specific styles
              isUpsideDown && !isTerminal && [
                "bg-black border-2 border-[#E71D36]",
                "text-[#E71D36] placeholder:text-[#E71D36]/30",
                "focus:border-[#E71D36] focus:ring-[#E71D36]/30",
                "font-['Courier_Prime']",
                // Focus: move into shadow
                "focus:translate-x-1 focus:translate-y-1",
                "shadow-[4px_4px_0px_0px_#333]",
                "focus:shadow-none focus:shadow-[0_0_20px_rgba(231,29,54,0.3)]",
                "rounded-none",
                "transition-all duration-200",
              ],

              !isUpsideDown && !isTerminal && [
                "bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)]",
                "text-[var(--color-neo-black)] placeholder:text-[var(--color-neo-black)]/50",
                "focus:border-[var(--color-neo-black)] focus:ring-[var(--color-neo-pink)]/30",
                "hover:border-[var(--color-neo-black)]",
                "rounded-[7mm]",
                // Neo shadow effect on focus
                "focus:translate-x-1 focus:translate-y-1",
                "shadow-[4px_4px_0px_0px_var(--color-neo-gray)]",
                "focus:shadow-none",
                "transition-all duration-200",
              ],

              // Terminal variant (always green)
              isTerminal && [
                "bg-black/90 border border-terminal-green/50",
                "text-terminal-green placeholder:text-terminal-green/30",
                "focus:border-terminal-green focus:ring-terminal-green/30",
                "caret-terminal-green",
                // Terminal glow
                "focus:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
                // Scanlines
                "bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)]",
                "bg-[length:100%_4px]",
              ],

              // Error state
              error && [
                "border-destructive focus:border-destructive focus:ring-destructive/30",
              ],

              className
            )}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "p-1 transition-colors",
                    isUpsideDown
                      ? "text-[#E71D36]/60 hover:text-[#E71D36] rounded-none"
                      : "text-lab-slate/60 hover:text-lab-slate rounded"
                  )}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span
                  className={cn(
                    isUpsideDown ? "text-[#E71D36]/60" : "text-lab-slate/60"
                  )}
                >
                  {rightIcon}
                </span>
              )}
            </div>
          )}

          {/* Blinking Cursor Effect (Terminal) */}
          {isTerminal && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-4 bg-terminal-green animate-pulse"
              style={{ animationDuration: "1s" }}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-xs font-mono text-destructive uppercase tracking-wider">
            ⚠ {error}
          </p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-2 text-xs font-mono text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

StrangerInput.displayName = "StrangerInput";

/* ═══════════════════════════════════════════════════════════════════════════
   TEXTAREA VARIANT
   ═══════════════════════════════════════════════════════════════════════════ */

interface StrangerTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  variant?: "default" | "terminal";
}

export const StrangerTextarea = React.forwardRef<
  HTMLTextAreaElement,
  StrangerTextareaProps
>(({ className, variant = "default", label, error, hint, ...props }, ref) => {
  const { isUpsideDown } = useTheme();
  const isTerminal = variant === "terminal";

  return (
    <div className="w-full">
      {label && (
        <label
          className={cn(
            "block text-sm font-mono uppercase tracking-wider mb-2",
            isUpsideDown ? "text-gate-red" : "text-lab-slate",
            error && "text-destructive"
          )}
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        className={cn(
          "w-full px-4 py-3 rounded-lg font-mono text-sm min-h-[120px] resize-y",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2",
          "placeholder:opacity-50",

          isUpsideDown && !isTerminal && [
            "bg-gate-dark/80 border border-gate-red/30",
            "text-foreground placeholder:text-gate-red/30",
            "focus:border-gate-red focus:ring-gate-red/30",
            "focus:shadow-[0_0_15px_rgba(225,29,72,0.2)]",
          ],

          !isUpsideDown && !isTerminal && [
            "bg-white border border-lab-steel/50",
            "text-lab-dark placeholder:text-lab-slate/50",
            "focus:border-lab-slate focus:ring-lab-slate/30",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
          ],

          isTerminal && [
            "bg-black/90 border border-terminal-green/50",
            "text-terminal-green placeholder:text-terminal-green/30",
            "focus:border-terminal-green focus:ring-terminal-green/30",
            "focus:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
          ],

          error && "border-destructive focus:border-destructive",

          className
        )}
        {...props}
      />

      {error && (
        <p className="mt-2 text-xs font-mono text-destructive uppercase tracking-wider">
          ⚠ {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-2 text-xs font-mono text-muted-foreground">{hint}</p>
      )}
    </div>
  );
});

StrangerTextarea.displayName = "StrangerTextarea";

export default StrangerInput;
