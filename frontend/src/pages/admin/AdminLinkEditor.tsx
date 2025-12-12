import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Link2,
  ArrowLeft,
  Loader2,
  Save,
  X,
  ExternalLink,
  Clock,
  MousePointerClick,
  Lock,
  Globe,
} from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerInput } from "@/components/ui/StrangerInput";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/services/api";

interface LinkDetails {
  _id: string;
  originalUrl: string;
  ownerId: string;
  ownerEmail?: string;
  clickCount: number;
  createdAt: any;
  security: {
    type?: string;
    password?: string;
    expiresAt?: string;
    maxClicks?: number;
    allowedDomain?: string;
  };
}

export default function AdminLinkEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, isAdmin } = useAuth();

  const [link, setLink] = useState<LinkDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authLoading && (!authUser || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [authUser, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (authUser && isAdmin && id) {
      fetchLinkDetails();
    }
  }, [authUser, isAdmin, id]);

  const fetchLinkDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminLinkDetails(id!);
      setLink(data);
      setOriginalUrl(data.originalUrl);
      setExpiresAt(data.security.expiresAt ? data.security.expiresAt.split("T")[0] : "");
      setMaxClicks(data.security.maxClicks?.toString() || "");
      setPassword(""); // Don't show existing password
    } catch (err: any) {
      setError(err.message || "Failed to fetch link details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updateData: any = {
        originalUrl,
      };

      if (expiresAt) {
        updateData.expiresAt = new Date(expiresAt).toISOString();
      }
      if (maxClicks) {
        updateData.maxClicks = parseInt(maxClicks);
      }
      if (password) {
        updateData.password = password;
      }

      await api.updateAdminLink(id!, updateData);
      setSuccess("Link updated successfully!");
      
      // Refresh data
      await fetchLinkDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update link");
    } finally {
      setSaving(false);
    }
  };

  const { isUpsideDown } = useTheme();

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isUpsideDown ? 'bg-[#050505]' : 'bg-[var(--color-neo-green)]'}`}>
        <Loader2 className={`w-8 h-8 animate-spin ${isUpsideDown ? 'text-[#E71D36] shadow-[0_0_20px_rgba(231,29,54,0.5)]' : 'text-[var(--color-neo-black)]'}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isUpsideDown ? 'bg-[#050505] text-white font-["Courier_Prime"]' : 'bg-[var(--color-neo-green)] text-[var(--color-neo-black)] font-sans'}`}>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-3xl">
        {/* Back Button */}
        <StrangerButton
          variant="secondary"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
        </StrangerButton>

        {error && !link && (
          <div className={`p-4 rounded-lg border-2 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36] text-[#E71D36]' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {error}
          </div>
        )}

        {link && (
          <>
            {/* Link Info Card */}
            <div className={`rounded-lg border-2 mb-6 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36]/50 shadow-[4px_4px_0_0_rgba(231,29,54,0.3)]' : 'bg-[var(--color-neo-cream)] border-[var(--color-neo-black)]'}`}>
              <div className={`p-6 border-b ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
                  <Link2 className={`w-6 h-6 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-green-dark)]'}`} />
                  Edit Link: <span className={`font-mono ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'}`}>{link._id}</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}>Owner</p>
                    <p className="font-medium">{link.ownerEmail || link.ownerId}</p>
                  </div>
                  <div>
                    <p className={isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}>Clicks</p>
                    <p className="font-medium">{link.clickCount}</p>
                  </div>
                  <div>
                    <p className={isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}>Created</p>
                    <p className="font-medium">
                      {link.createdAt
                        ? new Date(link.createdAt._seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}>Short URL</p>
                    <a
                      href={`${window.location.origin}/${link._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-medium flex items-center gap-1 ${isUpsideDown ? 'text-[#E71D36] hover:text-white' : 'text-[var(--color-neo-green-dark)] hover:underline'}`}
                    >
                      /{link._id} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className={`rounded-lg border-2 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36]/50 shadow-[4px_4px_0_0_rgba(231,29,54,0.3)]' : 'bg-[var(--color-neo-cream)] border-[var(--color-neo-black)]'}`}>
              <div className={`p-6 border-b ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                <h3 className={`text-lg font-bold ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>Edit Link Settings</h3>
              </div>
              <div className="p-6">
                {error && (
                  <div className={`p-3 rounded-lg mb-4 text-sm border ${isUpsideDown ? 'bg-[#050505] border-[#E71D36] text-[#E71D36]' : 'bg-red-100 border-red-400 text-red-700'}`}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className={`p-3 rounded-lg mb-4 text-sm border ${isUpsideDown ? 'bg-[#050505] border-green-500 text-green-500' : 'bg-green-100 border-green-400 text-green-700'}`}>
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Original URL */}
                  <div className="space-y-2">
                    <label htmlFor="originalUrl" className={`flex items-center gap-2 font-medium ${isUpsideDown ? 'text-white/80' : 'text-[var(--color-neo-black)]'}`}>
                      <Globe className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : ''}`} /> Destination URL
                    </label>
                    <StrangerInput
                      id="originalUrl"
                      value={originalUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOriginalUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <label htmlFor="expiresAt" className={`flex items-center gap-2 font-medium ${isUpsideDown ? 'text-white/80' : 'text-[var(--color-neo-black)]'}`}>
                      <Clock className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : ''}`} /> Expiry Date
                    </label>
                    <StrangerInput
                      id="expiresAt"
                      type="date"
                      value={expiresAt}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
                    />
                    <p className={`text-xs ${isUpsideDown ? 'text-white/40' : 'text-[var(--color-neo-black)]/50'}`}>Leave empty for no expiry</p>
                  </div>

                  {/* Max Clicks */}
                  <div className="space-y-2">
                    <label htmlFor="maxClicks" className={`flex items-center gap-2 font-medium ${isUpsideDown ? 'text-white/80' : 'text-[var(--color-neo-black)]'}`}>
                      <MousePointerClick className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : ''}`} /> Max Clicks
                    </label>
                    <StrangerInput
                      id="maxClicks"
                      type="number"
                      value={maxClicks}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxClicks(e.target.value)}
                      placeholder="Unlimited"
                    />
                    <p className={`text-xs ${isUpsideDown ? 'text-white/40' : 'text-[var(--color-neo-black)]/50'}`}>
                      Current: {link.clickCount} clicks. Leave empty for unlimited.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className={`flex items-center gap-2 font-medium ${isUpsideDown ? 'text-white/80' : 'text-[var(--color-neo-black)]'}`}>
                      <Lock className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : ''}`} /> New Password
                    </label>
                    <StrangerInput
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      placeholder={link.security.password ? "••••••• (leave empty to keep)" : "Set password (optional)"}
                    />
                    <p className={`text-xs ${isUpsideDown ? 'text-white/40' : 'text-[var(--color-neo-black)]/50'}`}>
                      {link.security.password
                        ? "Link is password protected. Enter new password to change it."
                        : "Leave empty for no password protection."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex gap-3 pt-4 border-t ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                    <StrangerButton
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </StrangerButton>
                    <StrangerButton
                      variant="secondary"
                      onClick={() => navigate("/admin")}
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </StrangerButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
