import { useState } from "react";
import { 
  Link2, Copy, ArrowRight, ShieldAlert, Zap, Loader2, 
  Bomb, Ghost, Fingerprint, ChevronDown, Lock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/common/Navbar"; // 👈 Import Navbar

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    // MOCK: Simulating network request for now
    setTimeout(() => {
      setShortLink("https://deadman.link/Xy9Zq2"); 
      setLoading(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortLink);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      
      {/* ================= HEADER ================= */}
      <Navbar /> 

      {/* ================= HERO SECTION ================= */}
      {/* Added pt-32 to account for the fixed header */}
      <section className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-950/30 rounded-full border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              <ShieldAlert className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Deadman<span className="text-red-600">Link</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Generate secure, ephemeral links. <br className="hidden md:block" />
            Share secrets that vanish when threats are detected.
          </p>
        </div>

        {/* Main Action Card */}
        <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-sm border-slate-800 shadow-2xl shadow-red-900/10 animate-in zoom-in-95 duration-500 relative z-10">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Shorten <span className="text-slate-500 text-sm font-normal ml-auto">(Guest Mode)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!shortLink ? (
              <form onSubmit={handleShorten} className="space-y-4">
                <div className="relative group">
                  <Link2 className="absolute left-3 top-3 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <Input 
                    placeholder="Paste your target URL here..." 
                    className="pl-10 bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-600 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide transition-all shadow-[0_0_10px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)]"
                  disabled={loading || !url}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> ENCRYPTING...</>
                  ) : (
                    "CREATE DEAD LINK"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-slate-950 border border-green-900/50 rounded-lg flex items-center justify-between group">
                  <span className="text-green-500 font-mono truncate mr-2 select-all group-hover:text-green-400 transition-colors">
                    {shortLink}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="hover:text-green-400 hover:bg-green-900/20">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => { setShortLink(""); setUrl(""); }}
                >
                  Shorten Another
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-950/50 border-t border-slate-800 p-4 text-xs text-slate-500 flex justify-between items-center rounded-b-xl">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> TLS Encryption
            </span>
            <Link to="/login" className="text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors group font-semibold">
              Unlock Password Protection <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardFooter>
        </Card>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce text-slate-600">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-100">Why Go Dark?</h2>
            <p className="text-slate-400 mt-2">Standard links leave traces. Deadman links disappear.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-900/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-900/20 transition-colors">
                <Bomb className="w-6 h-6 text-slate-300 group-hover:text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-200">Self-Destruction</h3>
              <p className="text-slate-400 leading-relaxed">
                Set links to auto-delete after a specific time or a single click. 
                Ensure your data exists only as long as it needs to.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-900/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-900/20 transition-colors">
                <Ghost className="w-6 h-6 text-slate-300 group-hover:text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-200">Total Anonymity</h3>
              <p className="text-slate-400 leading-relaxed">
                No tracking cookies. No user logs for guest links. 
                We act as a blind relay between you and the destination.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-900/50 transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-900/20 transition-colors">
                <Fingerprint className="w-6 h-6 text-slate-300 group-hover:text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-200">Threat Intelligence</h3>
              <p className="text-slate-400 leading-relaxed">
                Our AI scans destinations for malware. 
                If a link becomes suspicious, we kill it instantly to protect the network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION PROTOCOL (HOW IT WORKS) ================= */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-red-500 font-mono text-sm tracking-widest uppercase">Protocol Alpha</span>
            <h2 className="text-3xl font-bold text-slate-100 mt-2">Mission Protocol</h2>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4 md:gap-8">
              <div className="flex-none w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">1</div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white">Target Acquisition</h4>
                <p className="text-slate-400 mt-1">Paste your URL. Our system generates a unique, encrypted slug instantly.</p>
              </div>
            </div>
             {/* Connector Line */}
             <div className="w-0.5 h-8 bg-slate-800 ml-4 md:ml-6 my-2"></div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 md:gap-8">
              <div className="flex-none w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">2</div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white">Set Parameters</h4>
                <p className="text-slate-400 mt-1">Configure optional expiration triggers. (Login required for password protection).</p>
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-0.5 h-8 bg-slate-800 ml-4 md:ml-6 my-2"></div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 md:gap-8">
              <div className="flex-none w-8 h-8 md:w-12 md:h-12 rounded-full bg-red-900/30 border border-red-900 text-red-500 flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-white">Detonation</h4>
                <p className="text-slate-400 mt-1">Once the criteria are met (time or clicks), the link is permanently scrubbed from the database.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-20 bg-gradient-to-t from-red-950/20 to-slate-900 border-t border-slate-800 text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-6">Join the Network</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8">
          Unlock advanced features like password protection, custom slugs, and click tracking analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto bg-white text-slate-950 hover:bg-slate-200 font-bold">
              Access Dashboard
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              Create Agent ID
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center text-slate-600 text-sm border-t border-slate-900">
        <p>© 2025 Deadman Link. Encrypted & Secured.</p>
      </footer>
    </div>
  );
}