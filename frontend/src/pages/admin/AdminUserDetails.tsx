import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Link2,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  Clock,
  Shield,
} from "lucide-react";
import { StrangerButton } from "@/components/ui/StrangerButton";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/services/api";

interface UserDetails {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
  role?: string;
}

interface LinkData {
  _id: string;
  originalUrl: string;
  clickCount: number;
  createdAt: any;
  security: {
    type?: string;
    password?: boolean;
    expiresAt?: string;
    maxClicks?: number;
  };
}

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, isAdmin } = useAuth();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!authUser || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [authUser, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (authUser && isAdmin && id) {
      fetchUserDetails();
    }
  }, [authUser, isAdmin, id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminUserDetails(id!);
      setUserDetails(data.user);
      setLinks(data.links);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await api.adminDeleteLink(slug);
      setLinks(links.filter((l) => l._id !== slug));
    } catch (err: any) {
      alert(err.message || "Failed to delete link");
    }
  };

  const getStatus = (link: LinkData) => {
    const now = new Date();
    if (link.security.expiresAt && new Date(link.security.expiresAt) < now) {
      return { label: "Expired", color: "text-red-500 bg-red-900/20", neoColor: "text-red-700 bg-red-200 border border-red-400" };
    }
    if (link.security.maxClicks && link.clickCount >= link.security.maxClicks) {
      return { label: "Burned", color: "text-orange-500 bg-orange-900/20", neoColor: "text-orange-700 bg-orange-200 border border-orange-400" };
    }
    return { label: "Active", color: "text-green-500 bg-green-900/20", neoColor: "text-green-700 bg-green-200 border border-green-400" };
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

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <StrangerButton
          variant="secondary"
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
        </StrangerButton>

        {error ? (
          <div className={`p-4 rounded-lg border-2 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36] text-[#E71D36]' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {error}
          </div>
        ) : userDetails ? (
          <>
            {/* User Profile Card */}
            <div className={`rounded-lg border-2 mb-8 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36]/50 shadow-[4px_4px_0_0_rgba(231,29,54,0.3)]' : 'bg-[var(--color-neo-cream)] border-[var(--color-neo-black)]'}`}>
              <div className={`p-6 border-b ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
                  <User className={`w-6 h-6 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'}`} />
                  User Profile
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isUpsideDown ? 'bg-[#050505] border border-[#E71D36]/30' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)]'}`}>
                      <User className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Display Name</p>
                      <p className="font-medium">{userDetails.displayName || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isUpsideDown ? 'bg-[#050505] border border-[#E71D36]/30' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)]'}`}>
                      <Mail className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Email</p>
                      <p className="font-medium">{userDetails.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isUpsideDown ? 'bg-[#050505] border border-[#E71D36]/30' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)]'}`}>
                      <Shield className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Role</p>
                      <p className="font-medium capitalize">{userDetails.role || "user"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isUpsideDown ? 'bg-[#050505] border border-[#E71D36]/30' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)]'}`}>
                      <Calendar className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                    </div>
                    <div>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Joined</p>
                      <p className="font-medium">
                        {userDetails.createdAt
                          ? new Date(userDetails.createdAt._seconds * 1000).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className={`mt-6 pt-6 border-t ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                  <div className="flex gap-8">
                    <div>
                      <p className={`text-3xl font-bold ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'}`}>{links.length}</p>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Total Links</p>
                    </div>
                    <div>
                      <p className={`text-3xl font-bold ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-green-dark)]'}`}>
                        {links.reduce((acc, l) => acc + l.clickCount, 0)}
                      </p>
                      <p className={`text-sm ${isUpsideDown ? 'text-white/50' : 'text-[var(--color-neo-black)]/60'}`}>Total Clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User's Links Table */}
            <div className={`rounded-lg border-2 ${isUpsideDown ? 'bg-[#111111] border-[#E71D36]/50 shadow-[4px_4px_0_0_rgba(231,29,54,0.3)]' : 'bg-[var(--color-neo-cream)] border-[var(--color-neo-black)]'}`}>
              <div className={`p-6 border-b ${isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'}`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'}`}>
                  <Link2 className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-green-dark)]'}`} />
                  User's Links ({links.length})
                </h3>
              </div>
              <div className="p-6">
                {links.length === 0 ? (
                  <p className={`text-center py-8 ${isUpsideDown ? 'text-white/40' : 'text-[var(--color-neo-black)]/50'}`}>
                    This user hasn't created any links yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b text-left text-sm ${isUpsideDown ? 'border-[#E71D36]/30 text-white/60' : 'border-[var(--color-neo-black)] text-[var(--color-neo-black)]/70'}`}>
                          <th className="pb-3 font-medium">Short Code</th>
                          <th className="pb-3 font-medium">Original URL</th>
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
                            <tr
                              key={link._id}
                              className={`border-b ${isUpsideDown ? 'border-[#E71D36]/20 hover:bg-[#E71D36]/5' : 'border-[var(--color-neo-black)]/20 hover:bg-[var(--color-neo-cream-dark)]'}`}
                            >
                              <td className="py-4">
                                <span className={`font-mono ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-green-dark)]'}`}>{link._id}</span>
                              </td>
                              <td className="py-4">
                                <a
                                  href={link.originalUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-1 max-w-[200px] truncate ${isUpsideDown ? 'text-white/70 hover:text-[#E71D36]' : 'text-[var(--color-neo-black)]/70 hover:text-[var(--color-neo-black)]'}`}
                                >
                                  {link.originalUrl.substring(0, 40)}...
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </td>
                              <td className="py-4 text-center">
                                <span className={`px-2 py-1 rounded text-sm ${isUpsideDown ? 'bg-[#050505] border border-[#E71D36]/30' : 'bg-[var(--color-neo-cream-dark)] border border-[var(--color-neo-black)]'}`}>
                                  {link.clickCount}
                                  {link.security.maxClicks && (
                                    <span className={isUpsideDown ? 'text-white/40' : 'text-[var(--color-neo-black)]/50'}>
                                      /{link.security.maxClicks}
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${isUpsideDown ? status.color : status.neoColor}`}
                                >
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
                                    <span className={isUpsideDown ? 'text-white/20' : 'text-[var(--color-neo-black)]/30'}>-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Link to={`/admin/link/${link._id}`}>
                                    <button
                                      className={`p-2 rounded ${isUpsideDown ? 'text-[#E71D36] hover:text-white hover:bg-[#E71D36]/20' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)]'}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteLink(link._id)}
                                    className={`p-2 rounded ${isUpsideDown ? 'text-[#E71D36] hover:text-white hover:bg-[#E71D36]/20' : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-pink)]'}`}
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
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
