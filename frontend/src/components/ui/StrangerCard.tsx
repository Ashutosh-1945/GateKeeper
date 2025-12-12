import * as React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

/* ===========================================================================
   DUAL-UNIVERSE CARDS
   ===========================================================================
   
   LIGHT MODE (Retro Cream):
   - Cream colored background
   - Dark outline with depth shadow
   - Rounded corners (4mm)
   
   UPSIDE DOWN (Dark Mode):
   - Organic horror - pulsing red glow
   - Rounded corners, soft edges
   - Dark surfaces with rift energy
   =========================================================================== */

interface StrangerCardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "secondary" | "accent";
}

export function StrangerCard({
  className,
  variant = "default",
  children,
  ...props
}: StrangerCardProps) {
  const { isUpsideDown } = useTheme();

  // Dark mode - Hawkins Lab Brutalist Card
  if (isUpsideDown) {
    return (
      <div
        className={cn(
          "card-hawkins group",
          className
        )}
        {...props}
      >
        {/* Hard Shadow Block */}
        <div className="card-hawkins-shadow" />
        
        {/* Main Content Block */}
        <div className="card-hawkins-content">
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    );
  }

  // Light mode - Neo-Brutalist Card Style
  return (
    <div
      className={cn(
        "neo-card",
        className
      )}
      {...props}
    >
      <div className="neo-card-shadow" />
      <div className="neo-card-content">
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

// Card Header
export function StrangerCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {props.children}
    </div>
  );
}

// Card Title
export function StrangerCardTitle({
  className,
  ...props
}: React.ComponentProps<"h3">) {
  const { isUpsideDown } = useTheme();

  return (
    <h3
      className={cn(
        "text-2xl font-bold uppercase tracking-tight",
        isUpsideDown 
          ? "font-['Merriweather'] text-gray-100 group-hover:text-[#E71D36] transition-colors" 
          : "font-[var(--font-header)] text-[var(--color-neo-black)]",
        className
      )}
      {...props}
    />
  );
}

// Card Description
export function StrangerCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  const { isUpsideDown } = useTheme();

  return (
    <p
      className={cn(
        "text-sm",
        isUpsideDown 
          ? "font-['Courier_Prime'] text-gray-400 leading-relaxed" 
          : "font-bold text-black",
        className
      )}
      {...props}
    />
  );
}

// Card Content
export function StrangerCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex-1", className)} {...props} />
  );
}

// Card Footer
export function StrangerCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isUpsideDown } = useTheme();

  return (
    <div
      className={cn(
        "flex items-center gap-4 pt-4 mt-auto",
        isUpsideDown 
          ? "border-t border-[#333] text-[10px] text-[#E71D36] font-bold font-['Courier_Prime'] uppercase tracking-widest opacity-60" 
          : "border-t-4 border-black",
        className
      )}
      {...props}
    />
  );
}

// Stat Card for dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  const { isUpsideDown } = useTheme();

  return (
    <StrangerCard>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-xs uppercase tracking-widest font-semibold",
            isUpsideDown 
              ? "text-zinc-500 border-b border-red-500/30 inline-block" 
              : "text-[var(--color-cream-text)] opacity-70"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-4xl font-bold mt-2",
            isUpsideDown ? "text-vein" : "text-[var(--color-cream-text)]"
          )}>
            {value}
          </p>
          {description && (
            <p className={cn(
              "text-xs mt-2 font-medium",
              isUpsideDown ? "text-zinc-500" : "text-[var(--color-cream-text)] opacity-60"
            )}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-3 rounded-lg",
            isUpsideDown 
              ? "bg-red-500/10 text-red-500" 
              : "bg-[var(--color-cream-dark)] text-[var(--color-cream-text)]"
          )}>
            {icon}
          </div>
        )}
      </div>
    </StrangerCard>
  );
}

export default StrangerCard;
