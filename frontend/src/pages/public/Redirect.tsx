import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Loader2, Lock, ShieldAlert, ShieldCheck, Building2
} from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerInput } from "@/components/ui/StrangerInput";
import { useTheme } from "@/context/ThemeContext";

// Firebase Imports
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        const res = await axios.get<LinkResponse>(`${API_URL}/link/${slug}`);
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
      const res = await axios.post(`${API_URL}/link/${slug}/unlock`, { password });
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
      const res = await axios.post(`${API_URL}/link/${slug}/unlock-google`, { idToken: token });
      if (res.data.originalUrl) {
        setStatus("redirecting");
        window.location.href = res.data.originalUrl;
      }
    } catch (err) { setError("Verification failed."); setUnlocking(false); }
  };

  const { isUpsideDown } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isUpsideDown ? 'bg-[#050505] text-white' : 'bg-[var(--color-neo-green)] text-[var(--color-neo-black)]'}`}>
      <div className="max-w-md w-full">
        
        {/* === 1. LOADING === */}
        {status === "loading" && (
          <div className="text-center animate-in fade-in duration-500">
            <div className={`p-4 inline-block mb-4 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-full'}`}>
              <Loader2 className={`w-12 h-12 animate-spin ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
            </div>
            <h2 className={`text-xl font-black mb-2 ${isUpsideDown ? 'font-["Merriweather"]' : ''}`}>Verifying Protocol...</h2>
          </div>
        )}

        {/* === 2. REDIRECTING === */}
        {status === "redirecting" && (
           <div className="text-center animate-in zoom-in duration-300">
            <div className={`p-4 inline-block mb-4 ${isUpsideDown ? 'bg-black border-2 border-green-500 shadow-[4px_4px_0px_0px_green]' : 'bg-green-100 border-2 border-green-400 rounded-full'}`}>
              <ShieldCheck className={`w-12 h-12 ${isUpsideDown ? 'text-green-500' : 'text-green-600'}`} />
            </div>
            <h2 className={`text-xl font-black mb-2 ${isUpsideDown ? 'text-green-500 font-["Merriweather"]' : 'text-green-600'}`}>Access Granted</h2>
            <p className={isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}>Redirecting you now...</p>
          </div>
        )}

        {/* === 3. PASSWORD PROTECTED === */}
        {status === "protected" && (
           <div className={`p-6 animate-in zoom-in-95 ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg'}`}>
             <div className="text-center mb-6">
               <div className={`p-4 inline-block mb-4 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36]' : 'bg-amber-100 border-2 border-amber-400 rounded-full'}`}>
                 <Lock className={`w-12 h-12 ${isUpsideDown ? 'text-[#E71D36]' : 'text-amber-600'}`} />
               </div>
               <h2 className={`text-xl font-black mb-2 ${isUpsideDown ? 'text-[#E71D36] font-["Merriweather"]' : 'text-amber-600'}`}>Restricted Access</h2>
               <p className={`text-sm ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}`}>This node is encrypted. Enter passkey.</p>
             </div>
             <form onSubmit={handleUnlock} className="space-y-4">
               <StrangerInput 
                 type="password" 
                 placeholder="Enter Passkey" 
                 value={password} 
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
               />
               {error && <p className={`text-sm text-center ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'font-mono text-red-600'}`}>{error}</p>}
               <StrangerButton 
                 type="submit" 
                 disabled={unlocking || !password} 
                 className="w-full"
               >
                 {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unlock Node"}
               </StrangerButton>
             </form>
           </div>
        )}

        {/* === 4. GOOGLE GATE (ORG ACCESS) === */}
        {status === "google_gate" && (
           <div className={`p-6 text-center animate-in zoom-in-95 ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg'}`}>
             <div className={`p-4 inline-block mb-4 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36]' : 'bg-blue-100 border-2 border-blue-400 rounded-full'}`}>
               <Building2 className={`w-12 h-12 ${isUpsideDown ? 'text-[#E71D36]' : 'text-blue-600'}`} />
             </div>
             <h2 className={`text-xl font-black mb-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>Organization Access</h2>
             <p className={`mb-6 text-sm ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}`}>
               This link is locked. You must sign in with an email from: <br/>
               <span className={`font-bold px-2 py-1 mt-2 inline-block ${isUpsideDown ? 'text-[#E71D36] bg-black border border-[#E71D36] font-["Courier_Prime"]' : 'text-blue-700 bg-blue-100 border border-blue-400 font-mono rounded'}`}>
                 @{requiredDomain}
               </span>
             </p>
             {error && <p className={`text-sm mb-4 p-2 border ${isUpsideDown ? 'text-[#E71D36] bg-black border-[#E71D36] font-["Courier_Prime"]' : 'text-red-700 bg-red-100 border-red-400 rounded'}`}>{error}</p>}
             <StrangerButton 
               onClick={handleGoogleUnlock} 
               disabled={unlocking}
               variant="secondary"
               className="w-full"
             >
               {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify with Google"}
             </StrangerButton>
           </div>
        )}

        {/* === 5. ERROR === */}
        {status === "error" && (
           <div className="text-center animate-in zoom-in duration-300">
             <div className={`p-4 inline-block mb-4 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36]' : 'bg-red-100 border-2 border-red-400 rounded-full'}`}>
               <ShieldAlert className={`w-12 h-12 ${isUpsideDown ? 'text-[#E71D36]' : 'text-red-600'}`} />
             </div>
             <h2 className={`text-xl font-black mb-2 ${isUpsideDown ? 'text-[#E71D36] font-["Merriweather"]' : 'text-red-600'}`}>Link Destroyed</h2>
             <p className={`p-3 text-sm ${isUpsideDown ? 'text-white/70 bg-black border-2 border-[#E71D36] font-["Courier_Prime"]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] font-mono rounded'}`}>
               {error}
             </p>
           </div>
        )}

      </div>
    </div>
  );
}