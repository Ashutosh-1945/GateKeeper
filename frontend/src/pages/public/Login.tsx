import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Mail, Loader2, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 pt-20 relative overflow-hidden">
        
        {/* Ambient Red Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

        <Card className="w-full max-w-md bg-slate-900/90 border-slate-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-950 rounded-full border border-slate-800">
                <ShieldCheck className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">System Access</CardTitle>
            <CardDescription className="text-slate-400">
              Authenticate to access GateKeeper protocols.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="user" className="w-full">
              
              {/* The Switcher: User vs Admin */}
              <TabsList className="grid w-full grid-cols-2 bg-slate-950 border border-slate-800 mb-6">
                <TabsTrigger 
                  value="user" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
                >
                  <User className="w-4 h-4 mr-2" /> Agent
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-red-950 data-[state=active]:text-red-500 text-slate-400"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" /> Admin
                </TabsTrigger>
              </TabsList>

              {/* === USER LOGIN FORM === */}
              <TabsContent value="user">
                <form onSubmit={(e) => handleLogin(e, "user")} className="space-y-4">
                  {error && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}
                  <div className="space-y-2">
                    <Label htmlFor="email-user" className="text-slate-300">Agent Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input id="email-user" placeholder="agent@gatekeeper.net" className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-slate-500" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-user" className="text-slate-300">Password</Label>
                      <Link to="#" className="text-xs text-red-500 hover:text-red-400">Forgot?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input id="password-user" type="password" placeholder="••••••••" className="pl-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-slate-500" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 font-bold" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Access Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              {/* === ADMIN LOGIN FORM === */}
              <TabsContent value="admin">
                <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4">
                  {error && <p className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-md mb-4 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                      Warning: Unauthorized access to Command Override is a federal offense. All IP addresses are logged.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-admin" className="text-red-100">Command ID</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                      <Input id="email-admin" placeholder="admin@gatekeeper.net" className="pl-10 bg-slate-950 border-red-900/50 text-white placeholder:text-slate-600 focus-visible:ring-red-600" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-admin" className="text-red-100">Security Token</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-red-500" />
                      <Input id="password-admin" type="password" placeholder="••••••••" className="pl-10 bg-slate-950 border-red-900/50 text-white placeholder:text-slate-600 focus-visible:ring-red-600" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-red-600 text-white hover:bg-red-700 font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authenticate Command"}
                  </Button>
                </form>
              </TabsContent>

            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-800 p-4">
            <p className="text-sm text-slate-500">
              New to the network? <Link to="/register" className="text-white hover:underline underline-offset-4">Create Agent ID</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}