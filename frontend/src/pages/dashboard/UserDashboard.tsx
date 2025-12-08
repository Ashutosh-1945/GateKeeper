import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Link2, Copy, Trash2, ExternalLink, Loader2, 
  ShieldAlert, Clock, Lock, RefreshCw, Plus, Building2 // 👈 Added Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

// 👇 Updated Interface to match Backend
interface ILink {
  _id: string;
  originalUrl: string;
  ownerId: string;
  security: {
    type?: 'none' | 'password' | 'domain_lock'; // 👈 Added
    password?: string;
    allowedDomain?: string; // 👈 Added
    expiresAt?: string;
    maxClicks?: number;
  };
  clickCount: number;
  createdAt: any;
}

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<ILink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getUserLinks();
      setLinks(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to destroy this link?")) return;
    try {
      await api.deleteLink(id);
      setLinks(links.filter(link => link._id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete link");
    }
  };

  const copyToClipboard = (slug: string) => {
    // Uses the current window location to build the short link
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    alert("Copied to clipboard!");
  };

  const getStatus = (link: ILink) => {
    const now = new Date();
    if (link.security.expiresAt && new Date(link.security.expiresAt) < now) {
      return { label: "Expired", color: "text-red-500 bg-red-900/20" };
    }
    if (link.security.maxClicks && link.clickCount >= link.security.maxClicks) {
      return { label: "Burned", color: "text-orange-500 bg-orange-900/20" };
    }
    return { label: "Active", color: "text-green-500 bg-green-900/20" };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Command Center</h1>
            <p className="text-slate-400 mt-1">
              Welcome back, <span className="text-white font-mono">{user?.email?.split('@')[0]}</span>.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchLinks}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> New Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Link2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{links.length}</p>
                <p className="text-sm text-slate-400">Active Links</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-900/30 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {/* Count links that have ANY security (Pass or Domain) */}
                  {links.filter(l => l.security.password || l.security.allowedDomain).length}
                </p>
                <p className="text-sm text-slate-400">Secured Nodes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {links.filter(l => l.security.expiresAt).length}
                </p>
                <p className="text-sm text-slate-400">Self-Destructing</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-slate-400" />
              Network Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : links.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg mb-4">No active operations found.</p>
                <Button onClick={() => navigate("/")} variant="outline" className="border-slate-700">
                  Initialize First Link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400 text-sm">
                      <th className="pb-3 pl-2 font-medium">Identity (Slug)</th>
                      <th className="pb-3 font-medium">Target Destination</th>
                      <th className="pb-3 font-medium text-center">Hits</th>
                      <th className="pb-3 font-medium text-center">Security Level</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 pr-2 font-medium text-right">Protocol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => {
                      const status = getStatus(link);
                      return (
                        <tr key={link._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-red-400 font-bold">/{link._id}</span>
                              <button 
                                onClick={() => copyToClipboard(link._id)}
                                className="text-slate-600 hover:text-white transition-colors"
                                title="Copy Short Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col">
                              <a 
                                href={link.originalUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-slate-300 hover:text-white truncate max-w-[200px] flex items-center gap-1"
                              >
                                {link.originalUrl.replace(/^https?:\/\//, '').substring(0, 30)}...
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </a>
                              {/* 👇 Domain Badge */}
                              {link.security.allowedDomain && (
                                <span className="text-[10px] bg-blue-900/20 text-blue-400 border border-blue-900/30 px-1.5 py-0.5 rounded w-fit mt-1">
                                  @{link.security.allowedDomain}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className="font-mono font-bold">
                              {link.clickCount}
                              {link.security.maxClicks && (
                                <span className="text-slate-600 text-xs">/{link.security.maxClicks}</span>
                              )}
                            </span>
                          </td>
                          
                          {/* 👇 SECURITY COLUMN */}
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {link.security.password && (
                                <div title="Password Protected" className="p-1.5 bg-amber-900/20 rounded text-amber-500">
                                  <Lock className="w-4 h-4" />
                                </div>
                              )}
                              {link.security.allowedDomain && (
                                <div title={`Locked to: ${link.security.allowedDomain}`} className="p-1.5 bg-blue-900/20 rounded text-blue-500">
                                  <Building2 className="w-4 h-4" />
                                </div>
                              )}
                              {link.security.expiresAt && (
                                <div title="Self-Destruct Timer" className="p-1.5 bg-red-900/20 rounded text-red-500">
                                  <Clock className="w-4 h-4" />
                                </div>
                              )}
                              {!link.security.password && !link.security.allowedDomain && !link.security.expiresAt && (
                                <span className="text-slate-600 text-xs">-</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 pr-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(link._id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}