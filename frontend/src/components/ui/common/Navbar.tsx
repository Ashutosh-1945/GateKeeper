import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react"; 
import { Button } from "@/components/ui/button";

export default function Navbar() {
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

        {/* Right Side: Login / Signup Actions */}
        <div className="flex items-center gap-4">
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
        </div>

      </div>
    </header>
  );
}