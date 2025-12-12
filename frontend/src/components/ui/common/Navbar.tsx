import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, LayoutDashboard, ShieldAlert } from "lucide-react"; 
import { StrangerButton } from "@/components/ui/StrangerButton";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggleCompact } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const { user, loading, logout, isAdmin } = useAuth();
  const { isUpsideDown } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${isUpsideDown 
          ? "bg-[#050505]/95 border-b-2 border-[#E71D36] backdrop-blur-md" 
          : "bg-[var(--color-neo-cream)] border-b-2 border-[var(--color-neo-black)] shadow-[0_4px_0px_0px_var(--color-neo-gray)]"
        }
      `}
    >
      <div className="w-full px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: GateKeeper Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          {isUpsideDown ? (
            <div className="flex items-center gap-3 group-hover:-translate-y-0.5 transition-transform">
              <div className="relative">
                <div className="absolute inset-0 bg-[#E71D36] translate-x-1 translate-y-1" />
                <div className="relative bg-black border-2 border-[#E71D36] p-1.5">
                  <ShieldCheck className="w-6 h-6 text-[#E71D36]" />
                </div>
              </div>
              <span 
                className="text-2xl font-black tracking-wider transition-colors duration-300"
                style={{ fontFamily: "Merriweather, serif" }}
              >
                <span className="text-[#E71D36]">Gate</span>
                <span className="text-white">Keeper</span>
              </span>
            </div>
          ) : (
            <div className="neo-logo">
              <div className="neo-logo-shadow" />
              <div className="neo-logo-content flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[var(--color-neo-black)]" />
                <span className="text-[var(--color-neo-pink)]">Gate</span>
                <span className="text-[var(--color-neo-black)]">Keeper</span>
              </div>
            </div>
          )}
        </Link>

        {/* Right Side: Auth-dependent actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle - Always visible */}
          <ThemeToggleCompact />

          {loading ? (
            <div 
              className={`
                w-20 h-8 animate-pulse
                ${isUpsideDown ? "bg-[#111] border border-[#E71D36]/30" : "bg-[var(--color-cream-dark)] rounded"}
              `} 
            />
          ) : user ? (
            <>
              <span 
                className={`
                  text-sm hidden sm:block
                  ${isUpsideDown ? "text-white/70 font-['Courier_Prime']" : "text-[var(--color-cream-text)] font-medium"}
                `}
                style={{ fontFamily: isUpsideDown ? "Courier Prime, monospace" : "var(--font-body)" }}
              >
                Hello, <span className={isUpsideDown ? "text-[#E71D36]" : "font-semibold"}>
                  {user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className={`ml-1 ${isUpsideDown ? "text-[#E71D36]/70" : "text-[var(--color-primary)]"}`}>
                    (Admin)
                  </span>
                )}
              </span>
              <Link to="/dashboard">
                <StrangerButton 
                  variant="ghost" 
                  size="sm"
                  className={`
                    text-xs uppercase tracking-wider
                    ${isUpsideDown 
                      ? "text-white/70 hover:text-[#E71D36] hover:bg-[#E71D36]/10 font-['Courier_Prime']" 
                      : ""
                    }
                  `}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </StrangerButton>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <StrangerButton 
                    variant="ghost" 
                    size="sm"
                    className={`
                      text-xs uppercase tracking-wider
                      ${isUpsideDown 
                        ? "text-[#E71D36] hover:text-[#E71D36] hover:bg-[#E71D36]/10 font-['Courier_Prime']" 
                        : ""
                      }
                    `}
                  >
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Admin
                  </StrangerButton>
                </Link>
              )}
              <StrangerButton 
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                className={`
                  text-xs uppercase tracking-wider
                  ${isUpsideDown 
                    ? "border-[#E71D36] text-[#E71D36] hover:bg-[#E71D36]/10 font-['Courier_Prime']" 
                    : ""
                  }
                `}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </StrangerButton>
            </>
          ) : (
            // NOT LOGGED IN: Show Login and Sign Up links
            <>
              <Link to="/login">
                <StrangerButton 
                  variant="ghost"
                  size="sm"
                  className={`
                    text-xs uppercase tracking-wider
                    ${isUpsideDown 
                      ? "text-white/70 hover:text-[#E71D36] hover:bg-[#E71D36]/10 font-['Courier_Prime']" 
                      : ""
                    }
                  `}
                >
                  Log In
                </StrangerButton>
              </Link>
              <Link to="/register">
                <StrangerButton 
                  size="sm"
                  className={`
                    text-xs uppercase tracking-wider
                  `}
                >
                  Sign Up
                </StrangerButton>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}