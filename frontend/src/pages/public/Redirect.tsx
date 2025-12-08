import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
  Loader2, Lock, ShieldAlert, ShieldCheck, Building2, 
  Bot, ExternalLink, ArrowRight, ScanEye, AlertTriangle, Fingerprint
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

interface ScanResult {
  status: 'safe' | 'suspicious' | 'unsafe' | 'unknown';
  reason: string;
}

export default function Redirect() {
  const { slug } = useParams<{ slug: string }>();
  
  // STATUS FLOW: 
  // loading -> checkpoint (User choice) -> scanning (Animation) -> scanned (Result) -> redirecting
  // OR -> protected/google_gate (Locked)
  const [status, setStatus] = useState<"loading" | "checkpoint" | "scanning" | "scanned" | "protected" | "google_gate" | "error" | "redirecting">("loading");
  
  const [targetUrl, setTargetUrl] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
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
          // 🛑 STOP! Don't redirect. Show the Checkpoint.
          setTargetUrl(data.originalUrl);
          setStatus("checkpoint");
        }
      } catch (err: any) {
        setStatus("error");
        if (err.response?.status === 410) setError("This link has self-destructed.");
        else setError("Link not found or invalid.");
      }
    };
    checkLink();
  }, [slug]);

  // --- ACTIONS ---

  const handleScan = async () => {
    setStatus("scanning"); // Show Animation
    
    // Artificial delay (1.5s) so the animation looks cool/readable
    // Remove the Promise.all if you want it instant
    try {
      const [res] = await Promise.all([
        axios.post(`http://localhost:5000/api/link/scan`, { url: targetUrl }),
        new Promise(resolve => setTimeout(resolve, 1500)) 
      ]);
      
      setScanResult(res.data);
      setStatus("scanned");
    } catch (err) {
      setScanResult({ status: 'unknown', reason: "Could not complete scan." });
      setStatus("scanned");
    }
  };

  const handleProceed = () => {
    setStatus("redirecting");
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 800);
  };

  // --- UNLOCK LOGIC (Copy/Pasted from before) ---
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/link/${slug}/unlock`, { password });
      if (res.data.originalUrl) {
        setTargetUrl(res.data.originalUrl);
        setStatus("checkpoint"); // Go to checkpoint after unlock
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
        setTargetUrl(res.data.originalUrl);
        setStatus("checkpoint"); // Go to checkpoint after unlock
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
            <h2 className="text-xl font-bold mb-2">Establishing Link...</h2>
          </div>
        )}

        {/* === 2. CHECKPOINT (The Choice) === */}
        {status === "checkpoint" && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="p-4 bg-slate-800 rounded-full inline-block mb-4 border border-slate-700">
                <Fingerprint className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Security Checkpoint</h2>
              <p className="text-slate-400 text-sm">
                You are about to leave Deadman Link. Would you like to scan the destination for threats first?
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleScan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                <Bot className="mr-2 h-5 w-5" /> Verify Link Safety (AI)
              </Button>

              <Button 
                onClick={handleProceed}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Skip & Proceed <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* === 3. SCANNING (Animation) === */}
        {status === "scanning" && (
          <div className="text-center animate-in fade-in">
            <div className="relative inline-block mb-6">
              {/* Outer Ring */}
              <div className="w-24 h-24 border-4 border-blue-900/30 rounded-full"></div>
              {/* Spinning Ring */}
              <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              {/* Icon */}
              <ScanEye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold mb-1 text-blue-500 animate-pulse">Analyzing Packets...</h2>
            <p className="text-slate-500 text-sm">Checking Domain Reputation & Malware Signatures</p>
          </div>
        )}

        {/* === 4. SCANNED (The Verdict) === */}
        {status === "scanned" && scanResult && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl animate-in zoom-in-95">
            
            {/* Header Icon based on Result */}
            <div className="text-center mb-6">
              <div className={`p-4 rounded-full inline-block mb-4 border ${
                scanResult.status === 'safe' ? 'bg-green-900/20 border-green-900/50' :
                scanResult.status === 'unsafe' ? 'bg-red-900/20 border-red-900/50' :
                'bg-yellow-900/20 border-yellow-900/50'
              }`}>
                {scanResult.status === 'safe' && <ShieldCheck className="w-12 h-12 text-green-500" />}
                {scanResult.status === 'unsafe' && <ShieldAlert className="w-12 h-12 text-red-500" />}
                {scanResult.status === 'suspicious' && <AlertTriangle className="w-12 h-12 text-yellow-500" />}
                {scanResult.status === 'unknown' && <Bot className="w-12 h-12 text-slate-500" />}
              </div>
              
              <h2 className={`text-2xl font-bold mb-1 uppercase tracking-wide ${
                scanResult.status === 'safe' ? 'text-green-500' :
                scanResult.status === 'unsafe' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {scanResult.status === 'safe' ? "SAFE TO PROCEED" : "THREAT DETECTED"}
              </h2>
              <p className="text-slate-300 text-sm bg-slate-950 p-3 rounded mt-4 border border-slate-800">
                "{scanResult.reason}"
              </p>
            </div>

            <Button 
              onClick={handleProceed}
              className={`w-full font-bold h-12 ${
                scanResult.status === 'unsafe' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {scanResult.status === 'unsafe' ? "Proceed Anyway (Unsafe)" : "Continue to Destination"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* === 5. REDIRECTING === */}
        {status === "redirecting" && (
           <div className="text-center animate-in zoom-in duration-300">
            <div className="p-4 bg-green-900/20 rounded-full inline-block mb-4 border border-green-900/50">
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-green-500">Access Granted</h2>
            <p className="text-slate-400">Redirecting you now...</p>
          </div>
        )}

        {/* === PROTECTED / GOOGLE GATE / ERROR === */}
        {/* (Keep the existing UI code for these states from previous step) */}
        {status === "protected" && (
           /* ... Paste your previous Protected UI here ... */
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl">
             <div className="text-center mb-6"><Lock className="w-12 h-12 text-amber-500 mx-auto mb-4"/><h2 className="text-xl font-bold text-amber-500">Password Locked</h2></div>
             <form onSubmit={handleUnlock} className="space-y-4">
               <Input type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 text-white border-slate-700"/>
               {error && <p className="text-red-500 text-sm">{error}</p>}
               <Button type="submit" disabled={unlocking} className="w-full bg-amber-600 hover:bg-amber-700">Unlock</Button>
             </form>
           </div>
        )}

        {status === "google_gate" && (
           /* ... Paste your previous Google Gate UI here ... */
           <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl text-center">
             <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-white mb-2">Organization Access</h2>
             <p className="text-slate-400 mb-4">Required: <span className="text-blue-400">@{requiredDomain}</span></p>
             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
             <Button onClick={handleGoogleUnlock} className="w-full bg-white text-black hover:bg-slate-200">Verify with Google</Button>
           </div>
        )}

        {status === "error" && (
           <div className="text-center">
             <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-red-500">Link Error</h2>
             <p className="text-slate-400">{error}</p>
           </div>
        )}

      </div>
    </div>
  );
}