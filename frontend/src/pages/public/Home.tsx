import { useState } from "react";
import { 
  Link2, Copy, ArrowRight, ShieldAlert, Zap, Loader2, 
  Bomb, Ghost, Fingerprint, ChevronDown, Lock, Key, Clock, Hash, MousePointerClick, Building2,
  ShieldCheck, ShieldQuestion, ScanEye 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerCard, StrangerCardHeader, StrangerCardTitle, StrangerCardContent, StrangerCardFooter } from "@/components/ui/StrangerCard";
import { Link } from "react-router-dom";
import Navbar from "@/components/ui/common/Navbar";
import { api } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const { user } = useAuth();
  const { isUpsideDown } = useTheme();
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [password, setPassword] = useState("");
  const [allowedDomain, setAllowedDomain] = useState(""); 
  const [expiresIn, setExpiresIn] = useState(""); 
  const [maxClicks, setMaxClicks] = useState("");

  // 👇 New State for AI Scanning
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{status: string, reason: string} | null>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    
    try {
      const requestData: any = { originalUrl: url };
      
      if (customSlug) requestData.customSlug = customSlug;
      
      if (allowedDomain) {
        requestData.allowedDomain = allowedDomain;
        requestData.securityType = 'domain_lock';
      } else if (password) {
        requestData.password = password;
        requestData.securityType = 'password';
      }

      if (expiresIn) {
        const hours = parseInt(expiresIn);
        const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);
        requestData.expiresAt = expiryDate.toISOString();
      }
      if (maxClicks) requestData.maxClicks = parseInt(maxClicks);
      
      const data = await api.createLink(requestData);
      setShortLink(data.shortLink);
    } catch (err: any) {
      setError(err.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };


  const handleScan = async () => {
    if (!url) return;
    setScanning(true);
    setScanResult(null); // Clear previous results

    try {
      const requestData = { url };

      // API Call with 1.5s Animation Delay
      const [data] = await Promise.all([
        api.scanUrl(requestData), // 👈 Now matches the 'api.createLink' style
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      setScanResult(data);
    } catch (err: any) {
      setScanResult({ status: 'unknown', reason: err.message || "Scan failed." });
    } finally {
      setScanning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortLink);
    alert("Copied to clipboard!");
  };

  const resetForm = () => {
    setShortLink("");
    setUrl("");
    setCustomSlug("");
    setPassword("");
    setAllowedDomain("");
    setExpiresIn("");
    setMaxClicks("");
    setShowAdvanced(false);
    // Reset Scan State
    setScanning(false);
    setScanResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">

      <Navbar /> 

      {/* ================= HERO SECTION ================= */}
      <section className="flex-1 flex flex-col items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        
        <div className="text-center mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="flex justify-center mb-4">
            {isUpsideDown ? (
              <div className="relative">
                <div className="absolute inset-0 bg-[#E71D36] translate-x-2 translate-y-2" />
                <div className="relative bg-black border-2 border-[#E71D36] p-3">
                  <ShieldAlert className="w-10 h-10 text-[#E71D36]" />
                </div>
              </div>
            ) : (
              <div className="neo-icon-box w-16 h-16">
                <ShieldAlert className="w-8 h-8 text-[var(--color-neo-black)]" />
              </div>
            )}
          </div>
          <h1 
            className={`text-4xl md:text-6xl font-black tracking-tight mb-4 ${
              isUpsideDown 
                ? "text-white" 
                : "text-[var(--color-neo-cream)]"
            }`}
            style={{ 
              fontFamily: isUpsideDown ? "Merriweather, serif" : "var(--font-header)",
              textShadow: isUpsideDown ? "none" : "6px 6px 0px var(--color-neo-pink)"
            }}
          >
            Gate<span 
              className={isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-black)]"}
              style={{ textShadow: isUpsideDown ? "none" : "6px 6px 0px var(--color-neo-cream)" }}
            >Keeper</span>
          </h1>
          <p 
            className={`text-lg ${isUpsideDown ? "text-white/70 font-['Courier_Prime']" : "text-[var(--color-neo-cream)]"}`}
            style={{ fontFamily: isUpsideDown ? "Courier Prime, monospace" : "var(--font-body)" }}
          >
            Generate secure, ephemeral links. <br className="hidden md:block" />
            Share secrets that vanish when threats are detected.
          </p>
        </div>

        {/* Main Action Card */}
        <StrangerCard className="w-full max-w-md relative z-10">
          <StrangerCardHeader>
            <StrangerCardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-[var(--color-neo-pink)] dark:text-yellow-500" />
              {user ? "Agent Mode" : "Quick Shorten"} 
              <span className="opacity-60 text-sm font-normal ml-auto">
                {user ? `(${user.email?.split('@')[0]})` : "(Guest Mode)"}
              </span>
            </StrangerCardTitle>
          </StrangerCardHeader>
          <StrangerCardContent>
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
                
                {/* Advanced Options Toggle */}
                {user && (
                  <div className="space-y-3">
                    <button 
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </button>
                    
                    {showAdvanced && (
                      <div className="space-y-3 p-3 bg-slate-950 rounded-lg border border-slate-800 animate-in fade-in duration-200">
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            placeholder="Custom slug (e.g., my-link)"
                            className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm"
                            value={customSlug}
                            onChange={(e) => setCustomSlug(e.target.value)}
                          />
                        </div>
                        
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            type="password"
                            placeholder="Password protection"
                            className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={!!allowedDomain}
                          />
                        </div>

                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input 
                            placeholder="Limit to Domain (e.g. mnnit.ac.in)"
                            className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm"
                            value={allowedDomain}
                            onChange={(e) => setAllowedDomain(e.target.value)}
                            disabled={!!password}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input 
                              type="number"
                              placeholder="Expire (hrs)"
                              className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm"
                              value={expiresIn}
                              onChange={(e) => setExpiresIn(e.target.value)}
                              min="1"
                            />
                          </div>
                          <div className="relative">
                            <MousePointerClick className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                            <Input 
                              type="number"
                              placeholder="Max clicks"
                              className="pl-10 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm"
                              value={maxClicks}
                              onChange={(e) => setMaxClicks(e.target.value)}
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </form>
            ) : (
              // ============ SUCCESS VIEW ============
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-slate-950 border border-green-900/50 rounded-lg flex items-center justify-between group">
                  <span className="text-green-500 font-mono truncate mr-2 select-all group-hover:text-green-400 transition-colors">
                    {shortLink}
                  </span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} className="hover:text-green-400 hover:bg-green-900/20">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {/* 👇 AI SCAN SECTION (Only for Logged-In Users) */}
                {user && (
                  <div className="pt-2">
                    {/* 1. Initial State: Show Button */}
                    {!scanning && !scanResult && (
                      <Button 
                        onClick={handleScan}
                        className="w-full bg-blue-900/20 text-blue-400 border border-blue-900/50 hover:bg-blue-900/40 hover:text-white transition-all"
                      >
                        <ShieldQuestion className="mr-2 h-4 w-4" /> Verify Destination Safety (AI)
                      </Button>
                    )}

                    {/* 2. Loading State: Show Animation */}
                    {scanning && (
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-blue-900/30 rounded-lg">
                         <div className="relative inline-block mb-2">
                           {/* Radar Ring */}
                           <div className="w-8 h-8 border-2 border-blue-500/30 rounded-full"></div>
                           <div className="absolute top-0 left-0 w-8 h-8 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                           <ScanEye className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                         </div>
                         <p className="text-xs text-blue-400 animate-pulse font-mono">SCANNING TARGET...</p>
                      </div>
                    )}

                    {/* 3. Result State: Show Verdict */}
                    {scanResult && (
                      <div className={`p-3 rounded-md border text-sm flex items-start gap-3 animate-in zoom-in-95 ${
                        scanResult.status === 'safe' ? 'bg-green-900/20 border-green-900/50 text-green-400' :
                        scanResult.status === 'unsafe' ? 'bg-red-900/20 border-red-900/50 text-red-400' :
                        'bg-yellow-900/20 border-yellow-900/50 text-yellow-400'
                      }`}>
                        {scanResult.status === 'safe' && <ShieldCheck className="w-5 h-5 shrink-0" />}
                        {scanResult.status === 'unsafe' && <ShieldAlert className="w-5 h-5 shrink-0" />}
                        {scanResult.status === 'suspicious' && <ShieldAlert className="w-5 h-5 shrink-0" />}
                        {scanResult.status === 'unknown' && <ShieldQuestion className="w-5 h-5 shrink-0" />}
                        
                        <div>
                          <p className="font-bold uppercase tracking-wide text-xs mb-1">
                            VERDICT: {scanResult.status}
                          </p>
                          <p className="text-xs opacity-90 leading-relaxed">
                            {scanResult.reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={resetForm}
                >
                  Shorten Another
                </Button>
              </div>
            )}
          </StrangerCardContent>
          <StrangerCardFooter className="text-xs flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> TLS Encryption
            </span>
            {!user && (
              <Link to="/login" className="text-[var(--color-neo-pink)] hover:text-[var(--color-neo-pink-dark)] dark:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors group font-semibold">
                Unlock Password Protection <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </StrangerCardFooter>
        </StrangerCard>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce text-slate-600">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className={`py-24 border-t-2 ${
        isUpsideDown 
          ? "bg-[#050505] border-[#E71D36]" 
          : "bg-[var(--color-neo-cream)] border-[var(--color-neo-black)]"
      }`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-black ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)] neo-text-shadow-sm"}`} style={{ fontFamily: isUpsideDown ? "Merriweather, serif" : "var(--font-header)" }}>
              Why Go Dark?
            </h2>
            <p className={`mt-2 font-['Courier_Prime'] ${isUpsideDown ? "text-white/60" : "text-[var(--color-neo-black)] opacity-70"}`}>
              Standard links leave traces. Deadman links disappear.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className={`neo-card ${isUpsideDown ? "!rounded-none" : ""}`}>
              {!isUpsideDown && <div className="neo-card-shadow" />}
              <div className={`${
                isUpsideDown 
                  ? "relative p-6 bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#E71D36] transition-all group" 
                  : "neo-card-content group hover:translate-x-[-4px] hover:translate-y-[-4px]"
              }`}>
                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${
                  isUpsideDown 
                    ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] group-hover:shadow-[4px_4px_0px_0px_#E71D36] transition-all" 
                    : "bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg"
                }`}>
                  <Bomb className={`w-6 h-6 ${isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-black)]"}`} />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)]"}`}>Self-Destruction</h3>
                <p className={`leading-relaxed ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-black)] opacity-70"}`}>
                  Set links to auto-delete after a specific time or a single click. 
                  Ensure your data exists only as long as it needs to.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className={`neo-card ${isUpsideDown ? "!rounded-none" : ""}`}>
              {!isUpsideDown && <div className="neo-card-shadow" />}
              <div className={`${
                isUpsideDown 
                  ? "relative p-6 bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#E71D36] transition-all group" 
                  : "neo-card-content group hover:translate-x-[-4px] hover:translate-y-[-4px]"
              }`}>
                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${
                  isUpsideDown 
                    ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] group-hover:shadow-[4px_4px_0px_0px_#E71D36] transition-all" 
                    : "bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg"
                }`}>
                  <Ghost className={`w-6 h-6 ${isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-black)]"}`} />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)]"}`}>Total Anonymity</h3>
                <p className={`leading-relaxed ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-black)] opacity-70"}`}>
                  No tracking cookies. No user logs for guest links. 
                  We act as a blind relay between you and the destination.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className={`neo-card ${isUpsideDown ? "!rounded-none" : ""}`}>
              {!isUpsideDown && <div className="neo-card-shadow" />}
              <div className={`${
                isUpsideDown 
                  ? "relative p-6 bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#E71D36] transition-all group" 
                  : "neo-card-content group hover:translate-x-[-4px] hover:translate-y-[-4px]"
              }`}>
                <div className={`w-12 h-12 flex items-center justify-center mb-4 ${
                  isUpsideDown 
                    ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] group-hover:shadow-[4px_4px_0px_0px_#E71D36] transition-all" 
                    : "bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg"
                }`}>
                  <Fingerprint className={`w-6 h-6 ${isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-black)]"}`} />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)]"}`}>Threat Intelligence</h3>
                <p className={`leading-relaxed ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-black)] opacity-70"}`}>
                  Our AI scans destinations for malware. 
                  If a link becomes suspicious, we kill it instantly to protect the network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MISSION PROTOCOL ================= */}
      <section className={`py-24 relative overflow-hidden ${
        isUpsideDown ? "bg-black" : "bg-[var(--color-neo-green)]"
      }`}>
        {isUpsideDown && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#E71D36_1px,transparent_1px),linear-gradient(to_bottom,#E71D36_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10" />
        )}
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className={`font-['Courier_Prime'] text-sm tracking-widest uppercase ${
              isUpsideDown ? "text-[#E71D36]" : "text-[var(--color-neo-pink)]"
            }`}>Protocol Alpha</span>
            <h2 className={`text-3xl font-black mt-2 ${
              isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-cream)] neo-text-shadow-sm"
            }`} style={{ fontFamily: isUpsideDown ? "Merriweather, serif" : "var(--font-header)" }}>Mission Protocol</h2>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4 md:gap-8">
              <div className={`flex-none w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-black ${
                isUpsideDown 
                  ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] text-[#E71D36]" 
                  : "bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] text-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-full"
              }`}>1</div>
              <div>
                <h4 className={`text-lg md:text-xl font-black ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-cream)]"}`}>Target Acquisition</h4>
                <p className={`mt-1 ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-cream)] opacity-80"}`}>Paste your URL. Our system generates a unique, encrypted slug instantly.</p>
              </div>
            </div>
            <div className={`w-0.5 h-8 ml-4 md:ml-6 my-2 ${isUpsideDown ? "bg-[#E71D36]/30" : "bg-[var(--color-neo-black)]"}`}></div>
            <div className="flex items-start gap-4 md:gap-8">
              <div className={`flex-none w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-black ${
                isUpsideDown 
                  ? "bg-black border-2 border-[#E71D36] shadow-[3px_3px_0px_0px_#E71D36] text-[#E71D36]" 
                  : "bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] text-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-full"
              }`}>2</div>
              <div>
                <h4 className={`text-lg md:text-xl font-black ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-cream)]"}`}>Set Parameters</h4>
                <p className={`mt-1 ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-cream)] opacity-80"}`}>Configure optional expiration triggers. (Login required for password protection).</p>
              </div>
            </div>
            <div className={`w-0.5 h-8 ml-4 md:ml-6 my-2 ${isUpsideDown ? "bg-[#E71D36]/30" : "bg-[var(--color-neo-black)]"}`}></div>
            <div className="flex items-start gap-4 md:gap-8">
              <div className={`flex-none w-8 h-8 md:w-12 md:h-12 flex items-center justify-center font-black ${
                isUpsideDown 
                  ? "bg-[#E71D36] border-2 border-[#E71D36] text-black" 
                  : "bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] text-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-full"
              }`}>3</div>
              <div>
                <h4 className={`text-lg md:text-xl font-black ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-cream)]"}`}>Detonation</h4>
                <p className={`mt-1 ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-cream)] opacity-80"}`}>Once the criteria are met (time or clicks), the link is permanently scrubbed from the database.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className={`py-20 text-center px-4 border-t-2 ${
        isUpsideDown 
          ? "bg-[#111] border-[#E71D36]" 
          : "bg-[var(--color-neo-pink)] border-[var(--color-neo-black)]"
      }`}>
        {user ? (
          <>
            <h2 className={`text-3xl font-black mb-6 ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)]"}`} style={{ fontFamily: isUpsideDown ? "Merriweather, serif" : "var(--font-header)" }}>
              Welcome Back, Agent
            </h2>
            <p className={`max-w-lg mx-auto mb-8 ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-black)] opacity-80"}`}>
              Manage your links, track analytics, and configure advanced security from your dashboard.
            </p>
            <Link to="/dashboard">
              <StrangerButton size="lg">
                Go to Dashboard
              </StrangerButton>
            </Link>
          </>
        ) : (
          <>
            <h2 className={`text-3xl font-black mb-6 ${isUpsideDown ? "text-white font-['Merriweather']" : "text-[var(--color-neo-black)]"}`} style={{ fontFamily: isUpsideDown ? "Merriweather, serif" : "var(--font-header)" }}>
              Join the Network
            </h2>
            <p className={`max-w-lg mx-auto mb-8 ${isUpsideDown ? "text-white/60 font-['Courier_Prime']" : "text-[var(--color-neo-black)] opacity-80"}`}>
              Unlock advanced features like password protection, custom slugs, and click tracking analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <StrangerButton size="lg">
                  Access Dashboard
                </StrangerButton>
              </Link>
              <Link to="/register">
                <StrangerButton size="lg" variant="secondary">
                  Create Agent ID
                </StrangerButton>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className={`py-8 text-center text-sm border-t-2 ${
        isUpsideDown 
          ? "bg-black text-white/40 border-[#E71D36]/30 font-['Courier_Prime']" 
          : "bg-[var(--color-neo-cream)] text-[var(--color-neo-black)] border-[var(--color-neo-black)]"
      }`}>
        <p>© 2025 Deadman Link. Encrypted & Secured.</p>
      </footer>
    </div>
  );
}