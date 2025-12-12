import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerInput } from "@/components/ui/StrangerInput";
import { Label } from "@/components/ui/label";
import { StrangerCard, StrangerCardContent, StrangerCardDescription, StrangerCardFooter, StrangerCardHeader, StrangerCardTitle } from "@/components/ui/StrangerCard";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { isUpsideDown } = useTheme();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Encryption keys (passwords) do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isUpsideDown ? 'bg-[#050505]' : 'bg-[var(--color-neo-green)]'}`}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 pt-24 relative overflow-hidden">
        
        {/* Background effect */}
        {isUpsideDown && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E71D36]/10 blur-[100px] rounded-full pointer-events-none" />
        )}

        <StrangerCard className="w-full max-w-md relative z-10">
          <StrangerCardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              {isUpsideDown ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E71D36] translate-x-1 translate-y-1" />
                  <div className="relative bg-black border-2 border-[#E71D36] p-2">
                    <UserPlus className="w-6 h-6 text-[#E71D36]" />
                  </div>
                </div>
              ) : (
                <div className="neo-icon-box">
                  <UserPlus className="w-6 h-6 text-[var(--color-neo-black)]" />
                </div>
              )}
            </div>
            <StrangerCardTitle>New Agent Protocol</StrangerCardTitle>
            <StrangerCardDescription>
              Initialize a secure identity to join the network.
            </StrangerCardDescription>
          </StrangerCardHeader>

          <StrangerCardContent>
            {error && (
              <div className={`mb-6 p-3 flex items-start gap-3 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] rounded-xl'}`}>
                <AlertCircle className={`h-5 w-5 shrink-0 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                <p className={`text-sm font-bold ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Codename</Label>
                <StrangerInput 
                  id="username" 
                  placeholder="GhostWalker" 
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, username: e.target.value})}
                  leftIcon={<Shield className="h-4 w-4" />}
                  required 
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Secure Email</Label>
                <StrangerInput 
                  id="email" 
                  type="email"
                  placeholder="agent@gatekeeper.net" 
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required 
                />
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Password</Label>
                  <StrangerInput 
                    id="password" 
                    type="password" 
                    placeholder="••••••" 
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Confirm</Label>
                  <StrangerInput 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••" 
                    value={formData.confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, confirmPassword: e.target.value})}
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                    required 
                  />
                </div>
              </div>

              <StrangerButton 
                type="submit" 
                variant="danger"
                fullWidth 
                disabled={loading}
                isLoading={loading}
                loadingText="Initializing..."
              >
                Initialize Agent
              </StrangerButton>
            </form>
          </StrangerCardContent>
          
          <StrangerCardFooter className="flex justify-center">
            <p className={`text-sm ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>
              Already initialized? <Link to="/login" className={`font-bold hover:underline underline-offset-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`}>Access Terminal</Link>
            </p>
          </StrangerCardFooter>
        </StrangerCard>
      </div>
    </div>
  );
}