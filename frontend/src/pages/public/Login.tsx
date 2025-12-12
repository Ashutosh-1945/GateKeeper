import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, User, ShieldAlert } from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerInput } from "@/components/ui/StrangerInput";
import { Label } from "@/components/ui/label";
import { StrangerCard, StrangerCardContent, StrangerCardDescription, StrangerCardFooter, StrangerCardHeader, StrangerCardTitle } from "@/components/ui/StrangerCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Real Login Handler
  const handleLogin = async (e: React.FormEvent, type: "user" | "admin") => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      if (type === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const { isUpsideDown } = useTheme();

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
                    <ShieldCheck className="w-6 h-6 text-[#E71D36]" />
                  </div>
                </div>
              ) : (
                <div className="neo-icon-box">
                  <ShieldCheck className="w-6 h-6 text-[var(--color-neo-black)]" />
                </div>
              )}
            </div>
            <StrangerCardTitle>System Access</StrangerCardTitle>
            <StrangerCardDescription>
              Authenticate to access GateKeeper protocols.
            </StrangerCardDescription>
          </StrangerCardHeader>

          <StrangerCardContent>
            <Tabs defaultValue="user" className="w-full">
              
              {/* The Switcher: User vs Admin */}
              <TabsList className={`grid w-full grid-cols-2 mb-6 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-[7mm]'}`}>
                <TabsTrigger 
                  value="user" 
                  className={isUpsideDown 
                    ? "data-[state=active]:bg-[#E71D36] data-[state=active]:text-black text-white/60 font-['Courier_Prime'] rounded-none" 
                    : "data-[state=active]:bg-[var(--color-neo-cream)] data-[state=active]:text-[var(--color-neo-black)] text-[var(--color-neo-black)]/60 rounded-[6mm] font-bold"}
                >
                  <User className="w-4 h-4 mr-2" /> Agent
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className={isUpsideDown 
                    ? "data-[state=active]:bg-[#8a1120] data-[state=active]:text-white text-white/60 font-['Courier_Prime'] rounded-none"
                    : "data-[state=active]:bg-[var(--color-neo-pink)] data-[state=active]:text-[var(--color-neo-black)] text-[var(--color-neo-black)]/60 rounded-[6mm] font-bold"}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" /> Admin
                </TabsTrigger>
              </TabsList>

              {/* === USER LOGIN FORM === */}
              <TabsContent value="user">
                <form onSubmit={(e) => handleLogin(e, "user")} className="space-y-4">
                  {error && (
                    <p className={`text-sm text-center p-2 ${isUpsideDown ? 'text-[#E71D36] bg-[#E71D36]/10 border-2 border-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] rounded'}`}>
                      {error}
                    </p>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email-user" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Agent Email</Label>
                    <StrangerInput 
                      id="email-user" 
                      placeholder="agent@gatekeeper.net" 
                      required 
                      value={email} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                      leftIcon={<Mail className="h-4 w-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-user" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Password</Label>
                      <Link to="#" className={isUpsideDown ? 'text-xs text-[#E71D36] hover:text-[#E71D36]/80 font-["Courier_Prime"]' : 'text-xs text-[var(--color-neo-black)] hover:underline font-bold'}>Forgot?</Link>
                    </div>
                    <StrangerInput 
                      id="password-user" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={password} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                  </div>
                  <StrangerButton type="submit" fullWidth disabled={loading} isLoading={loading} loadingText="Authenticating...">
                    Access Dashboard
                  </StrangerButton>
                </form>
              </TabsContent>

              {/* === ADMIN LOGIN FORM === */}
              <TabsContent value="admin">
                <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                  {error && (
                    <p className={`text-sm text-center p-2 ${isUpsideDown ? 'text-[#E71D36] bg-[#E71D36]/10 border-2 border-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] rounded'}`}>
                      {error}
                    </p>
                  )}
                  <div className={`p-3 mb-4 flex items-start gap-3 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] rounded-xl'}`}>
                    <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                    <p className={`text-xs font-bold ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>
                      Warning: Unauthorized access to Command Override is a federal offense. All IP addresses are logged.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-admin" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Command ID</Label>
                    <StrangerInput 
                      id="email-admin" 
                      placeholder="admin@gatekeeper.net" 
                      required 
                      value={email} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      leftIcon={<ShieldCheck className="h-4 w-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin" className={isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] font-bold'}>Security Token</Label>
                    <StrangerInput 
                      id="password-admin" 
                      type="password" 
                      placeholder="••••••••" 
                      required 
                      value={password} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                  </div>
                  <StrangerButton type="submit" variant="danger" fullWidth disabled={loading} isLoading={loading} loadingText="Authenticating...">
                    Authenticate Command
                  </StrangerButton>
                </form>
              </TabsContent>

            </Tabs>
          </StrangerCardContent>
          
          <StrangerCardFooter className="flex justify-center">
            <p className={`text-sm ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>
              New to the network? <Link to="/register" className={`font-bold hover:underline underline-offset-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`}>Create Agent ID</Link>
            </p>
          </StrangerCardFooter>
        </StrangerCard>
      </div>
    </div>
  );
}