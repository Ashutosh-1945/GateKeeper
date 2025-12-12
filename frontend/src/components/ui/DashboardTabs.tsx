import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   🎮 AUTHENTIC STRANGER THINGS DASHBOARD TABS
   ═══════════════════════════════════════════════════════════════════════════
   
   HAWKINS (Light Mode): 
   - School locker doors (Hawkins Middle/High)
   - Retro 80s file tabs
   
   UPSIDE DOWN (Dark Mode): 
   - Arcade cabinet buttons (Palace Arcade)
   - Portal energy glow
   ═══════════════════════════════════════════════════════════════════════════ */

interface DashboardTabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

interface DashboardTabsProps {
  tabs: DashboardTabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

// Root Component
export const DashboardTabs = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: DashboardTabsProps) => {
  const { isUpsideDown } = useTheme();

  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      {/* Tab List */}
      <TabsPrimitive.List
        className={cn(
          "relative flex gap-2 p-2 rounded-lg mb-6",
          isUpsideDown
            ? "bg-[#0a0d0f] border border-[#ff0055]/20"
            : "bg-gradient-to-b from-[#e8dcc8] to-[#d4c4a8] border border-[#c4b69c] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
        )}
        style={{
          // Arcade cabinet wood grain for dark mode
          background: isUpsideDown 
            ? 'linear-gradient(180deg, #1a1a24 0%, #0a0d0f 100%)'
            : undefined,
        }}
      >
        {tabs.map((tab) => (
          <DashboardTabTrigger key={tab.value} tab={tab} />
        ))}

        {/* Decorative Portal Line (Dark Mode) */}
        {isUpsideDown && (
          <div 
            className="absolute -bottom-px left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,0,85,0.5), transparent)',
            }}
          />
        )}
      </TabsPrimitive.List>

      {/* Tab Content */}
      {children}
    </TabsPrimitive.Root>
  );
};

// Tab Trigger Component
const DashboardTabTrigger = ({ tab }: { tab: DashboardTabItem }) => {
  const { isUpsideDown } = useTheme();
  const Icon = tab.icon;

  return (
    <TabsPrimitive.Trigger
      value={tab.value}
      className={cn(
        "group relative flex-1 flex items-center justify-center gap-2 px-4 py-3",
        "text-sm uppercase tracking-[0.1em]",
        "rounded-md transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // Base styling
        isUpsideDown 
          ? "text-[#6b8080] hover:text-[#ff0055]" 
          : "text-[#6b5344] hover:text-[#d35400] hover:bg-[#fff9f0]/50",
        // Active state
        isUpsideDown
          ? "data-[state=active]:text-[#ff0055] data-[state=active]:bg-gradient-to-b data-[state=active]:from-[#1a232d] data-[state=active]:to-[#0f1419] data-[state=active]:border-2 data-[state=active]:border-[#ff0055]"
          : "data-[state=active]:text-[#d35400] data-[state=active]:bg-[#fff9f0] data-[state=active]:border data-[state=active]:border-[#d35400]/50 data-[state=active]:shadow-[0_2px_4px_rgba(211,84,0,0.15)]",
      )}
      style={{
        fontFamily: isUpsideDown 
          ? 'var(--font-arcade, VT323, monospace)' 
          : 'var(--font-typewriter, monospace)',
        fontSize: isUpsideDown ? '14px' : '12px',
      }}
    >
      {/* Icon */}
      {Icon && (
        <Icon className="w-4 h-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
      )}

      {/* Label */}
      <span>{tab.label}</span>

      {/* Badge */}
      {tab.badge !== undefined && (
        <span
          className="ml-1 px-2 py-0.5 text-xs rounded-full font-bold transition-colors duration-300"
          style={{
            background: isUpsideDown 
              ? 'rgba(255,0,85,0.2)' 
              : 'rgba(211,84,0,0.15)',
            color: isUpsideDown ? '#ff0055' : '#d35400',
          }}
        >
          {tab.badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
};

// Tab Content Component
export const DashboardTabContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { isUpsideDown } = useTheme();

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "rounded-lg p-6 transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isUpsideDown
          ? "bg-[#0f1419]/50 border border-[#ff0055]/20"
          : "bg-[#fff9f0] border border-[#d4c4a8] shadow-[0_2px_8px_rgba(139,115,85,0.1)]",
        // Animation
        "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0",
        className
      )}
      style={{
        boxShadow: isUpsideDown 
          ? '0 0 20px rgba(255,0,85,0.1), inset 0 0 40px rgba(255,0,85,0.03)'
          : undefined,
      }}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
});

DashboardTabContent.displayName = "DashboardTabContent";

/* ═══════════════════════════════════════════════════════════════════════════
   VERTICAL TABS VARIANT
   ═══════════════════════════════════════════════════════════════════════════ */

export const DashboardTabsVertical = ({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: DashboardTabsProps) => {
  const { isUpsideDown } = useTheme();

  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue || tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("flex gap-6", className)}
      orientation="vertical"
    >
      {/* Vertical Tab List */}
      <TabsPrimitive.List
        className={cn(
          "flex flex-col gap-1 p-2 rounded-lg min-w-[200px]",
          isUpsideDown
            ? "bg-[#0a0d0f] border border-[#ff0055]/20"
            : "bg-[#d4c4a8] border border-[#8b7355]/30"
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-md",
                "text-sm uppercase tracking-wider text-left",
                "transition-all duration-300",
                "focus:outline-none focus-visible:ring-2",
                isUpsideDown
                  ? [
                      "text-[#6b8080] hover:text-[#ff0055]",
                      "data-[state=active]:bg-[#0f1419] data-[state=active]:border data-[state=active]:border-[#ff0055]",
                      "data-[state=active]:text-[#ff0055]",
                      "focus-visible:ring-[#ff0055]",
                    ]
                  : [
                      "text-[#8b7355] hover:text-[#5c4033] hover:bg-[#ebe3d3]",
                      "data-[state=active]:bg-[#fffef8] data-[state=active]:border data-[state=active]:border-[#c4b69c]",
                      "data-[state=active]:text-[#5c4033]",
                      "focus-visible:ring-[#cc5500]",
                    ]
              )}
              style={{ fontFamily: 'var(--font-typewriter, monospace)' }}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="flex-1">{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs rounded-full font-bold",
                    isUpsideDown
                      ? "bg-[#ff0055]/20 text-[#ff0055] group-data-[state=active]:bg-[#ff0055] group-data-[state=active]:text-white"
                      : "bg-[#8b7355]/20 text-[#5c4033] group-data-[state=active]:bg-[#cc5500] group-data-[state=active]:text-white"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>

      {/* Content Area */}
      <div className="flex-1">{children}</div>
    </TabsPrimitive.Root>
  );
};

export default DashboardTabs;