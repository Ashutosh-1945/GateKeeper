/* ═══════════════════════════════════════════════════════════════════════════
   🔴 GATEKEEPER: STRANGER THINGS UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════
   A cinematic UI system inspired by Stranger Things
   - Light Mode: "Hawkins Lab" (Sterile, governmental, 80s control panels)  
   - Dark Mode: "The Upside Down" (Biological darkness, neon red veins)
   ═══════════════════════════════════════════════════════════════════════════ */

// Theme System
export { ThemeProvider, useTheme } from "@/context/ThemeContext";
export { 
  ThemeToggle, 
  ThemeToggleCompact, 
} from "./ThemeToggle";

// Cinematic Effects
export {
  MemphisBackground,
  AtmosphereTint,
  FloatingAsh,
  PortalGlow,
  CinematicOverlay,
} from "./CinematicEffects";

// Cards
export {
  StrangerCard,
  StrangerCardHeader,
  StrangerCardTitle,
  StrangerCardDescription,
  StrangerCardContent,
  StrangerCardFooter,
  StatCard,
} from "./StrangerCard";

// Buttons
export {
  StrangerButton,
} from "./StrangerButton";

// Inputs
export {
  StrangerInput,
  StrangerTextarea,
} from "./StrangerInput";

// Navigation
export {
  DashboardTabs,
  DashboardTabContent,
  DashboardTabsVertical,
} from "./DashboardTabs";

/* ═══════════════════════════════════════════════════════════════════════════
   USAGE EXAMPLES
   ═══════════════════════════════════════════════════════════════════════════

   // 1. Wrap your app with ThemeProvider
   <ThemeProvider defaultTheme="dark">
     <App />
   </ThemeProvider>

   // 2. Add cinematic effects
   <CinematicOverlay enableScanlines enableGrain enableSpores />

   // 3. Use themed components
   <StrangerCard stamp="classified">
     <StrangerCardHeader>
       <StrangerCardTitle>Welcome to Hawkins Lab</StrangerCardTitle>
     </StrangerCardHeader>
     <StrangerCardContent>
       Content here...
     </StrangerCardContent>
   </StrangerCard>

   // 4. Buttons
   <StrangerButton variant="arcade">Enter the Gate</StrangerButton>
   <StrangerButton variant="government">Submit Report</StrangerButton>
   <StrangerButton variant="terminal">Execute</StrangerButton>

   // 5. Inputs
   <StrangerInput variant="terminal" placeholder="Enter command..." />
   <StrangerInput variant="password" label="Access Code" />

   // 6. Dashboard Tabs
   <DashboardTabs tabs={[
     { value: "overview", label: "Overview", icon: Home },
     { value: "links", label: "Links", icon: Link2, badge: 42 },
   ]}>
     <DashboardTabContent value="overview">...</DashboardTabContent>
     <DashboardTabContent value="links">...</DashboardTabContent>
   </DashboardTabs>

   // 7. Toggle theme
   const { toggleTheme, isUpsideDown } = useTheme();

   ═══════════════════════════════════════════════════════════════════════════ */
