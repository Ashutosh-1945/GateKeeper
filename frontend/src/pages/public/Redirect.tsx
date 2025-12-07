import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/services/api";
import { Loader2, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Redirect() {
  const { slug } = useParams<{ slug: string }>();
  const [status, setStatus] = useState<"loading" | "protected" | "error" | "redirecting">("loading");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const checkLink = async () => {
      try {
        const data = await api.checkLink(slug);
        
        if (data.protected) {
          setStatus("protected");
        } else if (data.originalUrl) {
          setStatus("redirecting");
          // Redirect to the original URL
          window.location.href = data.originalUrl;
        }
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Link not found or has self-destructed");
      }
    };

    checkLink();
  }, [slug]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !password) return;
    
    setUnlocking(true);
    try {
      const data = await api.unlockLink(slug, password);
      if (data.originalUrl) {
        setStatus("redirecting");
        window.location.href = data.originalUrl;
      }
    } catch (err: any) {
      setError(err.message || "Incorrect password");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <div className="p-4 bg-slate-900 rounded-full inline-block mb-4">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying Link...</h2>
            <p className="text-slate-400">Running security checks</p>
          </div>
        )}

        {/* Redirecting State */}
        {status === "redirecting" && (
          <div className="text-center">
            <div className="p-4 bg-green-900/30 rounded-full inline-block mb-4">
              <ShieldCheck className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-green-500">Access Granted</h2>
            <p className="text-slate-400">Redirecting you now...</p>
          </div>
        )}

        {/* Password Protected State */}
        {status === "protected" && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="p-4 bg-amber-900/30 rounded-full inline-block mb-4">
                <Lock className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Password Protected</h2>
              <p className="text-slate-400">This link requires a password to access</p>
            </div>
            
            <form onSubmit={handleUnlock} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={unlocking || !password}
              >
                {unlocking ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Unlocking...</>
                ) : (
                  "Unlock Link"
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="p-4 bg-red-900/30 rounded-full inline-block mb-4">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-500">Link Destroyed</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-sm text-slate-500">
              This link has either expired, reached its click limit, or never existed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
