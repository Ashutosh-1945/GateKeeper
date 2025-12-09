import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Loader2, Lock, ShieldAlert, ShieldCheck, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Firebase Imports
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

interface LinkResponse {
  originalUrl?: string;
  protected?: boolean;
  google_gate?: boolean;
  requiredDomain?: string;
  error?: string;
}

export default function Redirect() {
  const { slug } = useParams<{ slug: string }>();
  
  // Status: loading -> protected/google_gate -> redirecting -> error
  const [status, setStatus] = useState<"loading" | "protected" | "google_gate" | "error" | "redirecting">("loading");
  
  const [error, setError] = useState("");
  
  // Unlock States
  const [password, setPassword] = useState("");
  const [requiredDomain, setRequiredDomain] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!slug || hasFetched.current) return; 
    hasFetched.current = true;      

    const checkLink = async () => {
      try {
        const res = await axios.get<LinkResponse>(`http://localhost:5000/api/link/${slug}`);
        const data = res.data;

        if (data.google_gate) {
          setRequiredDomain(data.requiredDomain || "organization");
          setStatus("google_gate");
        } 
        else if (data.protected) {
          setStatus("protected");
        } 
        else if (data.originalUrl) {
          // ✅ DIRECT REDIRECT (No Checkpoint)
          setStatus("redirecting");
          setTimeout(() => {
            window.location.href = data.originalUrl!;
          }, 800);
        }
      } catch (err: any) {
        setStatus("error");
        if (err.response?.status === 410) setError("This link has self-destructed.");
        else setError("Link not found or invalid.");
      }
    };
    checkLink();
  }, [slug]);

  // --- UNLOCK LOGIC ---
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/link/${slug}/unlock`, { password });
      if (res.data.originalUrl) {
        setStatus("redirecting");
        window.location.href = res.data.originalUrl;
      }
    } catch (err) { setError("Incorrect password."); setUnlocking(false); }
  };

  const handleGoogleUnlock = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      setUnlocking(true);
      const res = await axios.post(`http://localhost:5000/api/link/${slug}/unlock-google`, { idToken: token });
      if (res.data.originalUrl) {
        setStatus("redirecting");
        window.location.href = res.data.originalUrl;
      }
    } catch (err) { setError("Verification failed."); setUnlocking(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* === 1. LOADING === */}
        {status === "loading" && (
          <div className="text-center animate-in fade-in duration-500">
            <div className="p-4 bg-slate-900 rounded-full inline-block mb-4 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying Protocol...</h2>
          </div>
        )}

        {/* === 2. REDIRECTING === */}
        {status === "redirecting" && (
           <div className="text-center animate-in zoom-in duration-300">
            <div className="p-4 bg-green-900/20 rounded-full inline-block mb-4 border border-green-900/50">
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-green-500">Access Granted</h2>
            <p className="text-slate-400">Redirecting you now...</p>
          </div>
        )}

        {/* === 3. PASSWORD PROTECTED === */}
        {status === "protected" && (
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl animate-in zoom-in-95">
             <div className="text-center mb-6">
               <div className="p-4 bg-amber-900/20 rounded-full inline-block mb-4 border border-amber-900/50">
                 <Lock className="w-12 h-12 text-amber-500" />
               </div>
               <h2 className="text-xl font-bold text-amber-500 mb-2">Restricted Access</h2>
               <p className="text-slate-400 text-sm">This node is encrypted. Enter passkey.</p>
             </div>
             <form onSubmit={handleUnlock} className="space-y-4">
               <Input 
                 type="password" 
                 placeholder="Enter Passkey" 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className="bg-slate-950 text-white border-slate-700 focus-visible:ring-amber-500"
               />
               {error && <p className="text-red-500 text-sm text-center font-mono">{error}</p>}
               <Button 
                 type="submit" 
                 disabled={unlocking || !password} 
                 className="w-full bg-amber-600 hover:bg-amber-700 font-bold"
               >
                 {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Node"}
               </Button>
             </form>
           </div>
        )}

        {/* === 4. GOOGLE GATE (ORG ACCESS) === */}
        {status === "google_gate" && (
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl text-center animate-in zoom-in-95">
             <div className="p-4 bg-blue-900/20 rounded-full inline-block mb-4 border border-blue-900/50">
               <Building2 className="w-12 h-12 text-blue-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">Organization Access</h2>
             <p className="text-slate-400 mb-6 text-sm">
               This link is locked. You must sign in with an email from: <br/>
               <span className="text-blue-400 font-mono font-bold bg-blue-950/50 px-2 py-1 rounded mt-2 inline-block">
                 @{requiredDomain}
               </span>
             </p>
             {error && <p className="text-red-500 text-sm mb-4 bg-red-950/30 p-2 rounded border border-red-900/50">{error}</p>}
             <Button 
               onClick={handleGoogleUnlock} 
               disabled={unlocking}
               className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold flex items-center justify-center gap-2"
             >
               {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify with Google"}
             </Button>
           </div>
        )}

        {/* === 5. ERROR === */}
        {status === "error" && (
           <div className="text-center animate-in zoom-in duration-300">
             <div className="p-4 bg-red-900/20 rounded-full inline-block mb-4 border border-red-900/50">
               <ShieldAlert className="w-12 h-12 text-red-500" />
             </div>
             <h2 className="text-xl font-bold text-red-500 mb-2">Link Destroyed</h2>
             <p className="text-slate-300 bg-slate-900 p-3 rounded border border-slate-800 font-mono text-sm">
               {error}
             </p>
           </div>
        )}

      </div>
    </div>
  );
}