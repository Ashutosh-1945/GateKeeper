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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/common/Navbar";
import { useAuth } from "@/context/AuthContext";
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
      return { label: "Expired", color: "text-red-500 bg-red-900/20" };
    }
    if (link.security.maxClicks && link.clickCount >= link.security.maxClicks) {
      return { label: "Burned", color: "text-orange-500 bg-orange-900/20" };
    }
    return { label: "Active", color: "text-green-500 bg-green-900/20" };
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

      <main className="flex-1 container mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-6 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Panel
        </Button>

        {error ? (
          <div className="bg-red-900/20 border border-red-900 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        ) : userDetails ? (
          <>
            {/* User Profile Card */}
            <Card className="bg-slate-900 border-slate-800 mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-500" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Display Name</p>
                      <p className="font-medium">{userDetails.displayName || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="font-medium">{userDetails.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Shield className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Role</p>
                      <p className="font-medium capitalize">{userDetails.role || "user"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Joined</p>
                      <p className="font-medium">
                        {userDetails.createdAt
                          ? new Date(userDetails.createdAt._seconds * 1000).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-3xl font-bold text-blue-500">{links.length}</p>
                      <p className="text-sm text-slate-400">Total Links</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-green-500">
                        {links.reduce((acc, l) => acc + l.clickCount, 0)}
                      </p>
                      <p className="text-sm text-slate-400">Total Clicks</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User's Links Table */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-green-500" />
                  User's Links ({links.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {links.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">
                    This user hasn't created any links yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 text-left text-slate-400 text-sm">
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
                              className="border-b border-slate-800/50 hover:bg-slate-800/30"
                            >
                              <td className="py-4">
                                <span className="font-mono text-red-500">{link._id}</span>
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
                              <td className="py-4 text-center">
                                <span className="bg-slate-800 px-2 py-1 rounded text-sm">
                                  {link.clickCount}
                                  {link.security.maxClicks && (
                                    <span className="text-slate-500">
                                      /{link.security.maxClicks}
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td className="py-4 text-center">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}
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
                                    <span className="text-slate-600">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
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
                                </div>
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
          </>
        ) : null}
      </main>
    </div>
  );
}
