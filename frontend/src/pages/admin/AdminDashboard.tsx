import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Link2, Trash2, RefreshCw, Loader2, ShieldAlert, Eye, 
  Search, AlertTriangle, BarChart3, ScrollText, LayoutDashboard, 
  Menu, X, ExternalLink, Edit
} from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerInput } from "@/components/ui/StrangerInput";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
  const { isUpsideDown } = useTheme();

  if (authLoading) return <div className={`h-screen flex items-center justify-center ${isUpsideDown ? 'bg-[#050505]' : 'bg-[var(--color-neo-green)]'}`}><Loader2 className="animate-spin text-[#E71D36]" /></div>;

  return (
    <div className={`min-h-screen font-sans flex flex-col ${isUpsideDown ? 'bg-[#050505] text-white' : 'bg-[var(--color-neo-green)] text-[var(--color-neo-black)]'}`}>
      <Navbar />
      
      <div className="flex flex-1 pt-16 relative">
        
        {/* === SIDEBAR NAVIGATION === */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 hidden md:flex flex-col ${isUpsideDown ? 'bg-[#111] border-r-2 border-[#E71D36]' : 'bg-[var(--color-neo-cream)] border-r-2 border-[var(--color-neo-black)]'}`}>
          <div className="p-6 flex items-center justify-between">
            {sidebarOpen && (
              <h2 className={`text-xl font-black flex items-center gap-2 animate-in fade-in ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
                <ShieldAlert className={`w-6 h-6 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'}`} /> Admin
              </h2>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${isUpsideDown ? 'text-white/30 hover:text-white' : 'text-[var(--color-neo-black)]/50 hover:text-[var(--color-neo-black)]'}`}>
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all ${
                  activeView === item.id 
                    ? isUpsideDown 
                      ? 'bg-[#E71D36] text-black shadow-[4px_4px_0px_0px_#8a1120]' 
                      : 'bg-[var(--color-neo-pink)] text-[var(--color-neo-black)] border-2 border-[var(--color-neo-black)] shadow-[4px_4px_0px_0px_var(--color-neo-black)] rounded-lg'
                    : isUpsideDown
                      ? 'text-white/60 hover:bg-[#E71D36]/10 hover:text-white font-["Courier_Prime"]'
                      : 'text-[var(--color-neo-black)]/70 hover:bg-[var(--color-neo-cream-dark)] rounded-lg'
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
            <h1 className={`text-3xl font-black capitalize flex items-center gap-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'neo-text-shadow-sm text-[var(--color-neo-cream)]'}`} style={{ fontFamily: isUpsideDown ? 'Merriweather, serif' : 'var(--font-header)' }}>
              {activeView} <span className={`text-lg font-normal ${isUpsideDown ? 'text-white/40 font-["Courier_Prime"]' : 'text-[var(--color-neo-cream)]/70'}`}>/ Dashboard</span>
            </h1>
            
            <div className="flex gap-3">
              {(activeView === 'users' || activeView === 'links') && (
                <StrangerInput 
                  placeholder={`Search ${activeView}...`} 
                  className="w-full md:w-64"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              )}
              <StrangerButton variant="secondary" size="icon" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4" />
              </StrangerButton>
            </div>
          </div>

          {/* === DYNAMIC CONTENT SWITCH === */}
          
          {/* 1. OVERVIEW */}
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
              <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-blue-500" isUpsideDown={isUpsideDown} />
              <StatsCard title="Total Links" value={stats.totalLinks} icon={Link2} color="text-green-500" isUpsideDown={isUpsideDown} />
              <StatsCard title="Total Clicks" value={stats.totalClicks} icon={Eye} color="text-purple-500" isUpsideDown={isUpsideDown} />
              <StatsCard title="Active Links" value={stats.activeLinks} icon={AlertTriangle} color="text-amber-500" isUpsideDown={isUpsideDown} />
            </div>
          )}

          {/* 2. USERS TABLE */}
          {activeView === 'users' && (
            <div className={`overflow-hidden animate-in fade-in ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-lg'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`border-b ${isUpsideDown ? 'bg-black text-[#E71D36] border-[#E71D36]/30 font-["Courier_Prime"]' : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)]/70 border-[var(--color-neo-black)]'}`}>
                    <tr>
                      <th className="p-4">Email</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4 text-center">Links</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isUpsideDown ? 'divide-[#E71D36]/10' : 'divide-[var(--color-neo-black)]/20'}`}>
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className={`${isUpsideDown ? 'hover:bg-[#E71D36]/5' : 'hover:bg-[var(--color-neo-cream-dark)]'}`}>
                        <td className={`p-4 font-bold ${isUpsideDown ? 'text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>{u.email}</td>
                        <td className={`p-4 text-xs ${isUpsideDown ? 'text-white/30 font-["Courier_Prime"]' : 'font-mono text-[var(--color-neo-black)]/50'}`}>{u.uid}</td>
                        <td className="p-4 text-center"><span className={`px-2 py-1 ${isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36] font-["Courier_Prime"]' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)] rounded'}`}>{u.linksCount || 0}</span></td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/user/${u.uid}`)} 
                            className={`p-2 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded'}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.uid)} 
                            className={`p-2 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)] rounded'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            <div className={`overflow-hidden animate-in fade-in ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-lg'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className={`border-b ${isUpsideDown ? 'bg-black text-[#E71D36] border-[#E71D36]/30 font-["Courier_Prime"]' : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)]/70 border-[var(--color-neo-black)]'}`}>
                    <tr>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4 text-center">Clicks</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isUpsideDown ? 'divide-[#E71D36]/10' : 'divide-[var(--color-neo-black)]/20'}`}>
                    {filteredLinks.map(l => (
                      <tr key={l._id} className={`${isUpsideDown ? 'hover:bg-[#E71D36]/5' : 'hover:bg-[var(--color-neo-cream-dark)]'}`}>
                        <td className={`p-4 font-bold ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'font-mono text-[var(--color-neo-green-dark)]'}`}>/{l._id}</td>
                        <td className={`p-4 max-w-xs truncate ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                          <a href={l.originalUrl} target="_blank" className={`flex items-center gap-1 ${isUpsideDown ? 'hover:text-white' : 'hover:text-[var(--color-neo-black)]'}`}>
                            {l.originalUrl} <ExternalLink className="w-3 h-3"/>
                          </a>
                        </td>
                        <td className={`p-4 ${isUpsideDown ? 'text-white/70 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>{l.ownerEmail || 'Guest'}</td>
                        <td className={`p-4 text-center font-bold ${isUpsideDown ? 'text-white font-["Courier_Prime"]' : ''}`}>{l.clickCount}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/admin/link/${l._id}`)} 
                            className={`p-2 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded'}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLink(l._id)} 
                            className={`p-2 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)] rounded'}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            <div className={`overflow-hidden animate-in fade-in ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-lg'}`}>
              {loading ? (
                <div className={`p-12 text-center ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/50'}`}><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/> Loading Logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className={`border-b ${isUpsideDown ? 'bg-black text-[#E71D36] border-[#E71D36]/30 font-["Courier_Prime"]' : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)]/70 border-[var(--color-neo-black)]'}`}>
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Details</th>
                        <th className="p-4 text-right">IP</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isUpsideDown ? 'divide-[#E71D36]/10' : 'divide-[var(--color-neo-black)]/20'}`}>
                      {logs.map(log => (
                        <tr key={log._id} className={`${isUpsideDown ? 'hover:bg-[#E71D36]/5' : 'hover:bg-[var(--color-neo-cream-dark)]'}`}>
                          <td className={`p-4 text-xs whitespace-nowrap ${isUpsideDown ? 'text-white/40 font-["Courier_Prime"]' : 'font-mono text-[var(--color-neo-black)]/50'}`}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-bold ${
                              log.action.includes('DELETE') 
                                ? isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-red-200 text-red-700 border border-red-400 rounded'
                                : log.action.includes('SCAN') 
                                  ? isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-blue-200 text-blue-700 border border-blue-400 rounded'
                                  : isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-green-200 text-green-700 border border-green-400 rounded'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className={`p-4 ${isUpsideDown ? 'text-white/70 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>{log.performerEmail}</td>
                          <td className={`p-4 max-w-md truncate ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`} title={log.details}>{log.details}</td>
                          <td className={`p-4 text-right text-xs ${isUpsideDown ? 'text-white/30 font-["Courier_Prime"]' : 'font-mono text-[var(--color-neo-black)]/50'}`}>{log.metadata?.ip || '-'}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan={5} className={`p-8 text-center ${isUpsideDown ? 'text-white/40 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/50'}`}>No logs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 5. ANALYTICS (PLACEHOLDER) */}
          {activeView === 'analytics' && (
            <div className={`flex flex-col items-center justify-center h-96 border-2 border-dashed animate-in zoom-in-95 ${
              isUpsideDown ? 'border-[#E71D36]/30 bg-[#111]' : 'border-[var(--color-neo-black)] bg-[var(--color-neo-cream-dark)] rounded-lg'
            }`}>
              <div className={`p-4 mb-4 ${isUpsideDown ? 'bg-black border-2 border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] rounded-full'}`}>
                <BarChart3 className={`w-12 h-12 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
              </div>
              <h3 className={`text-xl font-black ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>Analytics Engine Offline</h3>
              <p className={`mt-2 max-w-sm text-center ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}`}>
                Geographic data, traffic heatmaps, and threat analysis visualizations will be enabled in the next system update.
              </p>
              <button disabled className={`mt-6 px-4 py-2 border-2 font-bold opacity-50 cursor-not-allowed ${
                isUpsideDown ? 'border-[#E71D36]/30 text-[#E71D36]/50' : 'border-[var(--color-neo-black)] text-[var(--color-neo-black)] rounded-md'
              }`}>Coming Soon</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color, isUpsideDown }: any) {
  return (
    <div className={`border-2 ${isUpsideDown ? 'bg-[#111] border-[#E71D36] shadow-[4px_4px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-[var(--color-neo-black)] rounded-lg'}`}>
      <div className="p-6 flex items-center gap-4">
        <div className={`p-3 border-2 ${isUpsideDown ? 'bg-black border-[#E71D36] text-[#E71D36]' : `bg-[var(--color-neo-cream-dark)] border-[var(--color-neo-black)] rounded-lg ${color}`}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className={`text-2xl font-black ${isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'}`}>{value}</p>
          <p className={`text-sm ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}`}>{title}</p>
        </div>
      </div>
    </div>
  );
}