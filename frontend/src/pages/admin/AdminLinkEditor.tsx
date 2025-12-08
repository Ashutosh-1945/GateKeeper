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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
        </Button>

        {error && !link && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {link && (
          <>
            {/* Link Info Card */}
            <Card className="bg-slate-900 border-slate-800 mb-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Link2 className="w-6 h-6 text-green-500" />
                  Edit Link: <span className="text-red-500 font-mono">{link._id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Owner</p>
                    <p className="font-medium">{link.ownerEmail || link.ownerId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Clicks</p>
                    <p className="font-medium">{link.clickCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Created</p>
                    <p className="font-medium">
                      {link.createdAt
                        ? new Date(link.createdAt._seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Short URL</p>
                    <a
                      href={`${window.location.origin}/${link._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                      /{link._id} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Edit Link Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-900/20 border border-red-900 text-red-500 p-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-900/20 border border-green-900 text-green-500 p-3 rounded-lg mb-4 text-sm">
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Original URL */}
                  <div className="space-y-2">
                    <Label htmlFor="originalUrl" className="text-slate-300 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Destination URL
                    </Label>
                    <Input
                      id="originalUrl"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt" className="text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Expiry Date
                    </Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500">Leave empty for no expiry</p>
                  </div>

                  {/* Max Clicks */}
                  <div className="space-y-2">
                    <Label htmlFor="maxClicks" className="text-slate-300 flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4" /> Max Clicks
                    </Label>
                    <Input
                      id="maxClicks"
                      type="number"
                      value={maxClicks}
                      onChange={(e) => setMaxClicks(e.target.value)}
                      placeholder="Unlimited"
                      min="1"
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      Current: {link.clickCount} clicks. Leave empty for unlimited.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={link.security.password ? "••••••• (leave empty to keep)" : "Set password (optional)"}
                      className="bg-slate-950 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      {link.security.password
                        ? "Link is password protected. Enter new password to change it."
                        : "Leave empty for no password protection."}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin")}
                      className="border-slate-700"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
