import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Loader2, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side Validation Only
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 pt-20 relative overflow-hidden">
        
        {/* Ambient Red Glow (Matches Login Theme) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

        <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-950 rounded-full border border-slate-800 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                <UserPlus className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">New Agent Protocol</CardTitle>
            <CardDescription className="text-slate-400">
              Initialize a secure identity to join the network.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-950/20 border-red-900/50 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Codename</Label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <Input 
                    id="username" 
                    placeholder="GhostWalker" 
                    className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Secure Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="agent@gatekeeper.net" 
                    className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••" 
                      className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">Confirm</Label>
                  <div className="relative group">
                    <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••" 
                      className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 text-white hover:bg-red-700 font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all mt-2" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initialize Agent"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-800 p-4">
            <p className="text-sm text-slate-500">
              Already initialized? <Link to="/login" className="text-white hover:text-red-400 transition-colors font-medium hover:underline underline-offset-4">Access Terminal</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}