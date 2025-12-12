import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const { isUpsideDown } = useTheme();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isUpsideDown ? 'bg-[#050505]' : 'bg-[var(--color-neo-green)]'}`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isUpsideDown ? 'text-[#E71D36] shadow-[0_0_20px_rgba(231,29,54,0.5)]' : 'text-[var(--color-neo-black)]'}`} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for admin requirement
  if (requireAdmin && !isAdmin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-center p-4 ${isUpsideDown ? 'bg-[#050505] font-["Courier_Prime"]' : 'bg-[var(--color-neo-green)]'}`}>
        <ShieldAlert className={`w-16 h-16 mb-4 ${isUpsideDown ? 'text-[#E71D36] drop-shadow-[0_0_10px_rgba(231,29,54,0.5)]' : 'text-[var(--color-neo-pink)]'}`} />
        <h1 className={`text-2xl font-bold mb-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>Access Denied</h1>
        <p className={`mb-4 ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>You don't have permission to access this page.</p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  // Render the protected content
  return <>{children}</>;
}
