import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Link2,
  Trash2,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Eye,
  Calendar,
  ExternalLink,
  Search,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
  linksCount?: number;
}

interface LinkData {
  _id: string;
  originalUrl: string;
  ownerId: string;
  ownerEmail?: string;
  clickCount: number;
  createdAt: any;
  security: {
    password?: boolean;
    expiresAt?: string;
    maxClicks?: number;
  };
}

interface Stats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalLinks: 0, totalClicks: 0, activeLinks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<'users' | 'links'>('users');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, linksData, statsData] = await Promise.all([
        api.getAllUsers(),
        api.getAllLinks(),
        api.getAdminStats(),
      ]);
      setUsers(usersData);
      setLinks(linksData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user? This will also delete all their links.")) return;
    try {
      await api.deleteUser(uid);
      setUsers(users.filter(u => u.uid !== uid));
      // Also remove links by this user
      setLinks(links.filter(l => l.ownerId !== uid));
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleDeleteLink = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await api.adminDeleteLink(slug);
      setLinks(links.filter(l => l._id !== slug));
    } catch (err: any) {
      alert(err.message || "Failed to delete link");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLinks = links.filter(l => 
    l._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-500" />
              Admin Control Panel
            </h1>
            <p className="text-slate-400 mt-1">
              System-wide management and monitoring
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchData}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-slate-400">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-lg">
                <Link2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalLinks}</p>
                <p className="text-sm text-slate-400">Total Links</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-900/30 rounded-lg">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
                <p className="text-sm text-slate-400">Total Clicks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeLinks}</p>
                <p className="text-sm text-slate-400">Active Links</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search users or links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              className={activeTab === 'users' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-700'}
            >
              <Users className="w-4 h-4 mr-2" /> Users ({users.length})
            </Button>
            <Button
              variant={activeTab === 'links' ? 'default' : 'outline'}
              onClick={() => setActiveTab('links')}
              className={activeTab === 'links' ? 'bg-red-600 hover:bg-red-700' : 'border-slate-700'}
            >
              <Link2 className="w-4 h-4 mr-2" /> Links ({links.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-slate-400 text-sm">
                        <th className="pb-3 font-medium">User ID</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium text-center">Links</th>
                        <th className="pb-3 font-medium">Joined</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userData) => (
                        <tr key={userData.uid} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4">
                            <span className="font-mono text-xs text-slate-500">
                              {userData.uid.substring(0, 12)}...
                            </span>
                          </td>
                          <td className="py-4">
                            <Link 
                              to={`/admin/user/${userData.uid}`}
                              className="text-slate-300 hover:text-red-400 hover:underline transition-colors"
                            >
                              {userData.email}
                            </Link>
                          </td>
                          <td className="py-4 text-slate-300">{userData.displayName || '-'}</td>
                          <td className="py-4 text-center">
                            <Link 
                              to={`/admin/user/${userData.uid}`}
                              className="bg-slate-800 px-2 py-1 rounded text-sm hover:bg-red-900/30 transition-colors"
                            >
                              {userData.linksCount || 0}
                            </Link>
                          </td>
                          <td className="py-4 text-slate-400 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {userData.createdAt ? new Date(userData.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 text-right flex gap-1 justify-end">
                            <Link to={`/admin/user/${userData.uid}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(userData.uid)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Links Table */
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-500" />
                System Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLinks.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No links found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-slate-400 text-sm">
                        <th className="pb-3 font-medium">Short Code</th>
                        <th className="pb-3 font-medium">Original URL</th>
                        <th className="pb-3 font-medium">Creator</th>
                        <th className="pb-3 font-medium text-center">Clicks</th>
                        <th className="pb-3 font-medium">Created</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLinks.map((link) => (
                        <tr key={link._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                          <td className="py-4">
                            <Link 
                              to={`/admin/link/${link._id}`}
                              className="font-mono text-red-500 hover:text-red-400 hover:underline transition-colors"
                            >
                              {link._id}
                            </Link>
                          </td>
                          <td className="py-4">
                            <a
                              href={link.originalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-300 hover:text-white flex items-center gap-1 max-w-[200px] truncate"
                            >
                              {link.originalUrl.substring(0, 40)}...
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          </td>
                          <td className="py-4 text-slate-400 text-sm">
                            {link.ownerId && link.ownerId !== 'guest' ? (
                              <Link 
                                to={`/admin/user/${link.ownerId}`}
                                className="hover:text-red-400 hover:underline transition-colors"
                              >
                                {link.ownerEmail || link.ownerId.substring(0, 8) + '...'}
                              </Link>
                            ) : (
                              <span className="text-slate-500">Guest</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className="bg-slate-800 px-2 py-1 rounded text-sm">
                              {link.clickCount}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400 text-sm">
                            {link.createdAt ? new Date(link.createdAt._seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 text-right flex gap-1 justify-end">
                            <Link to={`/admin/link/${link._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLink(link._id)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}