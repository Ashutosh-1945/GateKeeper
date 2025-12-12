import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Link2, Copy, Trash2, ExternalLink, Loader2, 
  ShieldAlert, Clock, Lock, RefreshCw, Plus, Building2,
  QrCode, Edit2, Tag, X, Filter, Check, BarChart2
} from "lucide-react";
import QRCode from "react-qr-code";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { StrangerCard, StrangerCardContent, StrangerCardHeader, StrangerCardTitle } from "@/components/ui/StrangerCard";
import { StrangerInput } from "@/components/ui/StrangerInput";
import Navbar from "@/components/ui/common/Navbar";
import AnalyticsView from "@/components/dashboard/AnalyticsView";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/services/api";

// 👇 Updated Interface to match Backend
interface ILink {
  _id: string;
  originalUrl: string;
  ownerId: string;
  tags?: string[]; // 👈 NEW: Tags array
  security: {
    type?: 'none' | 'password' | 'domain_lock';
    password?: string;
    allowedDomain?: string;
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

  // 👇 NEW: Filter state
  const [selectedTag, setSelectedTag] = useState<string>("");
  
  // 👇 NEW: QR Code Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrSlug, setQrSlug] = useState("");
  
  // 👇 NEW: Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ILink | null>(null);
  const [editSlug, setEditSlug] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // 👇 NEW: Analytics Modal state
  const [analyticsSlug, setAnalyticsSlug] = useState<string | null>(null);

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

  // 👇 NEW: Open QR Modal
  const openQrModal = (slug: string) => {
    setQrSlug(slug);
    setQrModalOpen(true);
  };

  // 👇 NEW: Open Edit Modal
  const openEditModal = (link: ILink) => {
    setEditingLink(link);
    setEditSlug(link._id);
    setEditTags(link.tags?.join(", ") || "");
    setEditModalOpen(true);
  };

  // 👇 NEW: Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editingLink) return;
    setEditLoading(true);
    
    try {
      const tagsArray = editTags
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const result = await api.updateLink(editingLink._id, {
        newSlug: editSlug !== editingLink._id ? editSlug : undefined,
        tags: tagsArray
      });

      // Update local state
      if (result.newSlug) {
        // Slug changed - update the link in state
        setLinks(links.map(l => 
          l._id === editingLink._id 
            ? { ...l, _id: result.newSlug, tags: tagsArray }
            : l
        ));
      } else {
        // Only tags changed
        setLinks(links.map(l =>
          l._id === editingLink._id
            ? { ...l, tags: tagsArray }
            : l
        ));
      }
      
      setEditModalOpen(false);
      setEditingLink(null);
    } catch (err: any) {
      alert(err.message || "Failed to update link");
    } finally {
      setEditLoading(false);
    }
  };

  // 👇 NEW: Get all unique tags from links
  const allTags = [...new Set(links.flatMap(l => l.tags || []))].sort();

  // 👇 NEW: Filter links by selected tag
  const filteredLinks = selectedTag
    ? links.filter(l => l.tags?.includes(selectedTag))
    : links;

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
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E71D36] animate-spin" />
      </div>
    );
  }

  const { isUpsideDown } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isUpsideDown ? 'bg-[#050505] text-white' : 'bg-[var(--color-neo-green)] text-[var(--color-neo-black)]'}`}>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-3xl font-black ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'neo-text-shadow-sm text-[var(--color-neo-cream)]'}`} style={{ fontFamily: isUpsideDown ? 'Merriweather, serif' : 'var(--font-header)' }}>Command Center</h1>
            <p className={`mt-1 ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-cream)]'}`}>
              Welcome back, <span className={`font-bold ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-cream)]'}`}>{user?.email?.split('@')[0]}</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <StrangerButton 
              variant="secondary"
              onClick={fetchLinks}
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </StrangerButton>
            <StrangerButton 
              onClick={() => navigate("/")}
              variant="danger"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" /> New Link
            </StrangerButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StrangerCard>
            <StrangerCardContent className="p-4 flex items-center gap-4">
              {isUpsideDown ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E71D36] translate-x-1 translate-y-1" />
                  <div className="relative bg-black border-2 border-[#E71D36] p-2">
                    <Link2 className="w-6 h-6 text-[#E71D36]" />
                  </div>
                </div>
              ) : (
                <div className="neo-icon-box">
                  <Link2 className="w-6 h-6 text-[var(--color-neo-black)]" />
                </div>
              )}
              <div>
                <p className={`text-2xl font-black ${isUpsideDown ? 'text-white' : ''}`}>{links.length}</p>
                <p className={`text-sm ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>Active Links</p>
              </div>
            </StrangerCardContent>
          </StrangerCard>
          
          <StrangerCard>
            <StrangerCardContent className="p-4 flex items-center gap-4">
              {isUpsideDown ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E71D36] translate-x-1 translate-y-1" />
                  <div className="relative bg-black border-2 border-[#E71D36] p-2">
                    <ShieldAlert className="w-6 h-6 text-[#E71D36]" />
                  </div>
                </div>
              ) : (
                <div className="neo-icon-box bg-[var(--color-neo-pink)]">
                  <ShieldAlert className="w-6 h-6 text-[var(--color-neo-black)]" />
                </div>
              )}
              <div>
                <p className={`text-2xl font-black ${isUpsideDown ? 'text-white' : ''}`}>
                  {links.filter(l => l.security.password || l.security.allowedDomain).length}
                </p>
                <p className={`text-sm ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>Secured Nodes</p>
              </div>
            </StrangerCardContent>
          </StrangerCard>

          <StrangerCard>
            <StrangerCardContent className="p-4 flex items-center gap-4">
              {isUpsideDown ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E71D36] translate-x-1 translate-y-1" />
                  <div className="relative bg-black border-2 border-[#E71D36] p-2">
                    <Clock className="w-6 h-6 text-[#E71D36]" />
                  </div>
                </div>
              ) : (
                <div className="neo-icon-box">
                  <Clock className="w-6 h-6 text-[var(--color-neo-black)]" />
                </div>
              )}
              <div>
                <p className={`text-2xl font-black ${isUpsideDown ? 'text-white' : ''}`}>
                  {links.filter(l => l.security.expiresAt).length}
                </p>
                <p className={`text-sm ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>Self-Destructing</p>
              </div>
            </StrangerCardContent>
          </StrangerCard>
        </div>

        {/* Links Table */}
        <StrangerCard>
          <StrangerCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <StrangerCardTitle className="text-lg flex items-center gap-2">
                <Link2 className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : ''}`} />
                Network Activity
              </StrangerCardTitle>
              
              {/* 👇 NEW: Tag Filter Dropdown */}
              {allTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className={`px-3 py-1.5 text-sm border-2 focus:outline-none ${
                      isUpsideDown 
                        ? 'bg-black text-[#E71D36] border-[#E71D36] font-["Courier_Prime"]' 
                        : 'bg-[var(--color-neo-cream)] text-[var(--color-neo-black)] border-[var(--color-neo-black)] rounded-lg'
                    }`}
                  >
                    <option value="">All Tags</option>
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  {selectedTag && (
                    <button 
                      onClick={() => setSelectedTag("")}
                      className={`p-1 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </StrangerCardHeader>
          <StrangerCardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className={`w-8 h-8 animate-spin ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'}`} />
              </div>
            ) : error ? (
              <div className={`text-center py-12 ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>{error}</div>
            ) : filteredLinks.length === 0 ? (
              <div className={`text-center py-12 ${isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                <p className="text-lg mb-4">{selectedTag ? `No links with tag "${selectedTag}"` : "No active operations found."}</p>
                {!selectedTag && (
                  <StrangerButton onClick={() => navigate("/")} variant="secondary">
                    Initialize First Link
                  </StrangerButton>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-left text-sm ${isUpsideDown ? 'border-[#E71D36]/30 text-[#E71D36] font-["Courier_Prime"]' : 'border-[var(--color-neo-black)] text-[var(--color-neo-black)]/70'}`}>
                      <th className="pb-3 pl-2 font-medium">Identity (Slug)</th>
                      <th className="pb-3 font-medium">Target / Tags</th>
                      <th className="pb-3 font-medium text-center">Hits</th>
                      <th className="pb-3 font-medium text-center">Security</th>
                      <th className="pb-3 font-medium text-center">Status</th>
                      <th className="pb-3 pr-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.map((link) => {
                      const status = getStatus(link);
                      return (
                        <tr key={link._id} className={`border-b transition-colors ${isUpsideDown ? 'border-[#E71D36]/10 hover:bg-[#E71D36]/5' : 'border-[var(--color-neo-black)]/20 hover:bg-[var(--color-neo-cream-dark)]'}`}>
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'font-mono text-[var(--color-neo-black)]'}`}>/{link._id}</span>
                              <button 
                                onClick={() => copyToClipboard(link._id)}
                                className={`transition-colors ${isUpsideDown ? 'text-white/30 hover:text-white' : 'text-[var(--color-neo-black)]/50 hover:text-[var(--color-neo-black)]'}`}
                                title="Copy Short Link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1.5">
                              <a 
                                href={link.originalUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className={`truncate max-w-[200px] flex items-center gap-1 ${isUpsideDown ? 'text-white/70 hover:text-white font-["Courier_Prime"]' : 'text-[var(--color-neo-black)] hover:underline'}`}
                              >
                                {link.originalUrl.replace(/^https?:\/\//, '').substring(0, 30)}...
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </a>
                              {/* 👇 NEW: Tags Display */}
                              {link.tags && link.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {link.tags.map(tag => (
                                    <span 
                                      key={tag}
                                      onClick={() => setSelectedTag(tag)}
                                      className={`text-[10px] px-1.5 py-0.5 cursor-pointer transition-colors ${
                                        isUpsideDown 
                                          ? 'bg-black text-[#E71D36]/80 border border-[#E71D36]/50 hover:border-[#E71D36] font-["Courier_Prime"]' 
                                          : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)]/80 border border-[var(--color-neo-black)]/30 hover:border-[var(--color-neo-black)] rounded'
                                      }`}
                                    >
                                      <Tag className="w-2.5 h-2.5 inline mr-0.5" />{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {link.security.allowedDomain && (
                                <span className={`text-[10px] px-1.5 py-0.5 w-fit ${isUpsideDown ? 'bg-black text-[#E71D36] border border-[#E71D36] font-["Courier_Prime"]' : 'bg-[var(--color-neo-pink)] text-[var(--color-neo-black)] border border-[var(--color-neo-black)] rounded'}`}>
                                  @{link.security.allowedDomain}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`font-bold ${isUpsideDown ? 'font-["Courier_Prime"] text-white' : 'font-mono'}`}>
                              {link.clickCount}
                              {link.security.maxClicks && (
                                <span className={`text-xs ${isUpsideDown ? 'text-white/30' : 'text-[var(--color-neo-black)]/50'}`}>/{link.security.maxClicks}</span>
                              )}
                            </span>
                          </td>
                          
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {link.security.password && (
                                <div title="Password Protected" className={`p-1 ${isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-[var(--color-neo-pink)] text-[var(--color-neo-black)] border border-[var(--color-neo-black)] rounded'}`}>
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {link.security.allowedDomain && (
                                <div title={`Locked to: ${link.security.allowedDomain}`} className={`p-1 ${isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)] border border-[var(--color-neo-black)] rounded'}`}>
                                  <Building2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {link.security.expiresAt && (
                                <div title="Self-Destruct Timer" className={`p-1 ${isUpsideDown ? 'bg-black border border-[#E71D36] text-[#E71D36]' : 'bg-[var(--color-neo-pink)] text-[var(--color-neo-black)] border border-[var(--color-neo-black)] rounded'}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                </div>
                              )}
                              {!link.security.password && !link.security.allowedDomain && !link.security.expiresAt && (
                                <span className={`text-xs ${isUpsideDown ? 'text-white/30' : 'text-[var(--color-neo-black)]/50'}`}>-</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 text-center">
                            <span className={`px-2 py-1 text-xs font-bold uppercase ${isUpsideDown ? `${status.color} border border-current font-["Courier_Prime"]` : 'bg-[var(--color-neo-cream-dark)] text-[var(--color-neo-black)] border border-[var(--color-neo-black)] rounded'}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 pr-2">
                            {/* 👇 NEW: Action Buttons (Analytics, QR, Edit, Delete) */}
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => setAnalyticsSlug(link._id)}
                                className={`p-1.5 transition-colors ${isUpsideDown ? 'text-white/50 hover:text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]/50' : 'text-[var(--color-neo-black)]/60 hover:text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)]/50 border border-transparent hover:border-[var(--color-neo-black)]/30 rounded'}`}
                                title="View Analytics"
                              >
                                <BarChart2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openQrModal(link._id)}
                                className={`p-1.5 transition-colors ${isUpsideDown ? 'text-white/50 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/30' : 'text-[var(--color-neo-black)]/60 hover:text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] border border-transparent hover:border-[var(--color-neo-black)]/30 rounded'}`}
                                title="Show QR Code"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => openEditModal(link)}
                                className={`p-1.5 transition-colors ${isUpsideDown ? 'text-white/50 hover:text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]/50' : 'text-[var(--color-neo-black)]/60 hover:text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)]/50 border border-transparent hover:border-[var(--color-neo-black)]/30 rounded'}`}
                                title="Edit Link"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(link._id)}
                                className={`p-1.5 transition-colors ${isUpsideDown ? 'text-[#E71D36]/70 hover:text-[#E71D36] hover:bg-[#E71D36]/10 border border-transparent hover:border-[#E71D36]' : 'text-[var(--color-neo-black)]/60 hover:text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)] border border-transparent hover:border-[var(--color-neo-black)] rounded'}`}
                                title="Delete Link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </StrangerCardContent>
        </StrangerCard>
      </main>

      {/* ========== QR CODE MODAL ========== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-sm p-6 ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] shadow-[6px_6px_0px_0px_var(--color-neo-black)] rounded-lg'}`}>
            <button 
              onClick={() => setQrModalOpen(false)}
              className={`absolute top-3 right-3 p-1 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded'}`}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className={`text-lg font-bold mb-4 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
              QR Code for /{qrSlug}
            </h3>
            
            <div className={`p-4 flex justify-center ${isUpsideDown ? 'bg-white' : 'bg-white border-2 border-[var(--color-neo-black)] rounded'}`}>
              <QRCode 
                value={`${window.location.origin}/${qrSlug}`}
                size={200}
                level="H"
                fgColor={isUpsideDown ? "#E71D36" : "#242622"}
              />
            </div>
            
            <p className={`mt-4 text-xs text-center break-all ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
              {window.location.origin}/{qrSlug}
            </p>
          </div>
        </div>
      )}

      {/* ========== EDIT LINK MODAL ========== */}
      {editModalOpen && editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md p-6 ${isUpsideDown ? 'bg-[#111] border-2 border-[#E71D36] shadow-[6px_6px_0px_0px_#E71D36]' : 'bg-[var(--color-neo-cream)] border-2 border-[var(--color-neo-black)] shadow-[6px_6px_0px_0px_var(--color-neo-black)] rounded-lg'}`}>
            <button 
              onClick={() => { setEditModalOpen(false); setEditingLink(null); }}
              className={`absolute top-3 right-3 p-1 ${isUpsideDown ? 'text-[#E71D36] hover:bg-[#E71D36]/10' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded'}`}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className={`text-lg font-bold mb-6 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
              Edit Link
            </h3>
            
            <div className="space-y-4">
              {/* Slug Field */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>
                  Slug (Back-half)
                </label>
                <StrangerInput
                  value={editSlug}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditSlug(e.target.value)}
                  placeholder="my-custom-slug"
                />
                <p className={`mt-1 text-xs ${isUpsideDown ? 'text-white/40 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'}`}>
                  Warning: Changing the slug will update all shared links.
                </p>
              </div>
              
              {/* Tags Field */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'}`}>
                  Tags (comma-separated)
                </label>
                <StrangerInput
                  value={editTags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTags(e.target.value)}
                  placeholder="work, marketing, campaign"
                  leftIcon={<Tag className="w-4 h-4" />}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <StrangerButton
                  variant="secondary"
                  onClick={() => { setEditModalOpen(false); setEditingLink(null); }}
                  className="flex-1"
                >
                  Cancel
                </StrangerButton>
                <StrangerButton
                  variant="danger"
                  onClick={handleEditSubmit}
                  disabled={editLoading || !editSlug.trim()}
                  isLoading={editLoading}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" /> Save
                </StrangerButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== ANALYTICS MODAL ========== */}
      {analyticsSlug && (
        <AnalyticsView 
          slug={analyticsSlug} 
          onClose={() => setAnalyticsSlug(null)} 
        />
      )}
    </div>
  );
}