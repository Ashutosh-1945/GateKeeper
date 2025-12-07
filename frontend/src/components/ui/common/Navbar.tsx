import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      {/* Changed max-w-7xl to w-full and increased padding to px-6 or px-8 for better spacing */}
      <div className="w-full px-6 md:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: GateKeeper Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <ShieldCheck className="w-8 h-8 text-red-600 group-hover:text-red-500 transition-colors" />
          <span className="text-2xl font-bold tracking-tight text-slate-100">
            <span className="text-red-600">Gate</span>Keeper
          </span>
        </Link>

        {/* Right Side: Auth-dependent actions */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Show nothing or a skeleton while checking auth
            <div className="w-20 h-8 bg-slate-800 animate-pulse rounded" />
          ) : user ? (
            // LOGGED IN: Show Dashboard link, greeting, and Logout button
            <>
              <span className="text-slate-400 text-sm hidden sm:block">
                Hello, <span className="text-red-500">{user.email?.split('@')[0]}</span>
              </span>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="border-red-900 text-red-500 hover:bg-red-900/20 hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            // NOT LOGGED IN: Show Login and Sign Up links
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}