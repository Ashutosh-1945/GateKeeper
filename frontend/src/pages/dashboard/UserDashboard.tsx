import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Link2, Copy, Trash2, ExternalLink, Loader2, 
  ShieldAlert, Clock, Eye, Lock, RefreshCw, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface ILink {
  _id: string;
  originalUrl: string;
  ownerId: string;
  security: {
    password?: string;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.email?.split('@')[0] || 'Agent'}</h1>
            <p className="text-slate-400 mt-1">
              Manage your dead links from the Command Center
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
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Create New Link
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
                <p className="text-sm text-slate-400">Total Links</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-lg">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {links.reduce((acc, link) => acc + link.clickCount, 0)}
                </p>
                <p className="text-sm text-slate-400">Total Clicks</p>
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
                  {links.filter(l => l.security.password).length}
                </p>
                <p className="text-sm text-slate-400">Protected Links</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Table */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Your Dead Links
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
                <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">You haven't created any links yet.</p>
                <p className="text-sm mb-4">Start by creating your first dead link from the home page.</p>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400 text-sm">
                      <th className="pb-3 font-medium">Short Link</th>
                      <th className="pb-3 font-medium">Destination</th>
                      <th className="pb-3 font-medium text-center">Clicks</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 font-medium text-center">Security</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => {
                      const status = getStatus(link);
                      return (
                        <tr key={link._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-red-500">{link._id}</span>
                              <button 
                                onClick={() => copyToClipboard(link._id)}
                                className="text-slate-500 hover:text-white"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <a 
                              href={link.originalUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-slate-300 hover:text-white truncate max-w-[200px] block flex items-center gap-1"
                            >
                              {link.originalUrl.substring(0, 40)}...
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-4 text-center">
                            <span className="font-mono">
                              {link.clickCount}
                              {link.security.maxClicks && (
                                <span className="text-slate-500">/{link.security.maxClicks}</span>
                              )}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {link.security.password && (
                                <span title="Password Protected">
                                  <Lock className="w-4 h-4 text-amber-500" />
                                </span>
                              )}
                              {link.security.expiresAt && (
                                <span title="Has Expiry">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                </span>
                              )}
                              {!link.security.password && !link.security.expiresAt && (
                                <span className="text-slate-600">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(link._id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
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
