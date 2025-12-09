import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Link2, Trash2, RefreshCw, Loader2, ShieldAlert, Eye, 
  Search, AlertTriangle, BarChart3, ScrollText, LayoutDashboard, 
  Menu, X, ExternalLink, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

// --- Types ---
interface UserData { uid: string; email: string; displayName?: string; createdAt: any; linksCount?: number; }
interface LinkData { _id: string; originalUrl: string; ownerId: string; ownerEmail?: string; clickCount: number; createdAt: any; }
interface LogEntry { _id: string; action: string; performerEmail: string; details: string; timestamp: string; metadata?: { ip: string }; }
interface Stats { totalUsers: number; totalLinks: number; totalClicks: number; activeLinks: number; }

export default function AdminDashboard() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // 1. VIEW STATE
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'links' | 'logs' | 'analytics'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // 2. DATA STATE
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalLinks: 0, totalClicks: 0, activeLinks: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // 3. FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");

  // Auth Check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Initial Data Fetch
  useEffect(() => {
    if (user && isAdmin) fetchStats();
  }, [user, isAdmin]);

  // Lazy Fetching based on View
  useEffect(() => {
    if (activeView === 'users' && users.length === 0) fetchUsers();
    if (activeView === 'links' && links.length === 0) fetchLinks();
    if (activeView === 'logs') fetchLogs();
  }, [activeView]);

  // --- API CALLS ---
  const fetchStats = async () => { try { setStats(await api.getAdminStats()); } catch (e) { console.error(e); } };
  
  const fetchUsers = async () => {
    setLoading(true);
    try { setUsers(await api.getAllUsers()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  
  const fetchLinks = async () => {
    setLoading(true);
    try { setLinks(await api.getAllLinks()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  
  const fetchLogs = async () => {
    setLoading(true);
    try { setLogs(await api.getLogs()); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- ACTIONS ---
  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Delete this user?")) return;
    try { await api.deleteUser(uid); setUsers(users.filter(u => u.uid !== uid)); } catch (e) { alert("Failed"); }
  };
  const handleDeleteLink = async (slug: string) => {
    if (!confirm("Delete this link?")) return;
    try { await api.adminDeleteLink(slug); setLinks(links.filter(l => l._id !== slug)); } catch (e) { alert("Failed"); }
  };

  // --- HELPERS ---
  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredLinks = links.filter(l => l.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-red-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Navbar />
      
      <div className="flex flex-1 pt-16 relative">
        
        {/* === SIDEBAR NAVIGATION === */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 border-r border-slate-800 transition-all duration-300 hidden md:flex flex-col`}>
          <div className="p-6 flex items-center justify-between">
            {sidebarOpen && (
              <h2 className="text-xl font-bold flex items-center gap-2 text-white animate-in fade-in">
                <ShieldAlert className="w-6 h-6 text-red-500" /> Admin
              </h2>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-white">
              {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5 mx-auto"/>}
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-2 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'links', label: 'Links', icon: Link2 },
              { id: 'logs', label: 'Audit Logs', icon: ScrollText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeView === item.id 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* === MAIN CONTENT AREA === */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-64px)]">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold capitalize flex items-center gap-2">
              {activeView} <span className="text-slate-600 text-lg font-normal">/ Dashboard</span>
            </h1>
            
            <div className="flex gap-3">
              {(activeView === 'users' || activeView === 'links') && (
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder={`Search ${activeView}...`} 
                    className="pl-9 bg-slate-900 border-slate-700 w-full md:w-64"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
              <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="border-slate-700 shrink-0">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* === DYNAMIC CONTENT SWITCH === */}
          
          {/* 1. OVERVIEW */}
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" />
              <StatsCard title="Total Links" value={stats.totalLinks} icon={Link2} color="text-green-500" />
              <StatsCard title="Total Clicks" value={stats.totalClicks} icon={Eye} color="text-purple-500" />
              <StatsCard title="Active Links" value={stats.activeLinks} icon={AlertTriangle} color="text-amber-500" />
            </div>
          )}

          {/* 2. USERS TABLE */}
          {activeView === 'users' && (
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden animate-in fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4 text-center">Links</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-slate-800/50">
                        <td className="p-4 font-medium text-slate-200">{u.email}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{u.uid}</td>
                        <td className="p-4 text-center"><span className="bg-slate-800 px-2 py-1 rounded">{u.linksCount || 0}</span></td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/admin/user/${u.uid}`)} 
                            className="text-blue-500 hover:bg-blue-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteUser(u.uid)} 
                            className="text-red-500 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. LINKS TABLE */}
          {activeView === 'links' && (
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden animate-in fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4 text-center">Clicks</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLinks.map(l => (
                      <tr key={l._id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-mono text-red-400">/{l._id}</td>
                        <td className="p-4 max-w-xs truncate text-slate-400">
                          <a href={l.originalUrl} target="_blank" className="hover:text-white flex items-center gap-1">
                            {l.originalUrl} <ExternalLink className="w-3 h-3"/>
                          </a>
                        </td>
                        <td className="p-4 text-slate-300">{l.ownerEmail || 'Guest'}</td>
                        <td className="p-4 text-center font-bold">{l.clickCount}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/admin/link/${l._id}`)} 
                            className="text-blue-500 hover:bg-blue-900/20"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteLink(l._id)} 
                            className="text-red-500 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. LOGS TABLE */}
          {activeView === 'logs' && (
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden animate-in fade-in">
              {loading ? (
                <div className="p-12 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/> Loading Logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950/50 text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Details</th>
                        <th className="p-4 text-right">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {logs.map(log => (
                        <tr key={log._id} className="hover:bg-slate-800/50">
                          <td className="p-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              log.action.includes('DELETE') ? 'bg-red-900/20 text-red-400' : 
                              log.action.includes('SCAN') ? 'bg-blue-900/20 text-blue-400' : 'bg-green-900/20 text-green-400'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{log.performerEmail}</td>
                          <td className="p-4 text-slate-400 max-w-md truncate" title={log.details}>{log.details}</td>
                          <td className="p-4 text-right font-mono text-xs text-slate-500">{log.metadata?.ip || '-'}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No logs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. ANALYTICS (PLACEHOLDER) */}
          {activeView === 'analytics' && (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/50 animate-in zoom-in-95">
              <div className="p-4 bg-slate-800 rounded-full mb-4">
                <BarChart3 className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">Analytics Engine Offline</h3>
              <p className="text-slate-500 mt-2 max-w-sm text-center">
                Geographic data, traffic heatmaps, and threat analysis visualizations will be enabled in the next system update.
              </p>
              <Button variant="outline" className="mt-6 border-slate-700" disabled>Coming Soon</Button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`p-3 rounded-lg bg-slate-950 border border-slate-800 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}