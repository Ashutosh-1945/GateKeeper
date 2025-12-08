import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import Redirect from "@/pages/public/Redirect";
import UserDashboard from "@/pages/dashboard/UserDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import AdminLinkEditor from "@/pages/admin/AdminLinkEditor";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";



export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Layer 1: Public Guest Access */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect Handler for Short Links */}
          <Route path="/:slug" element={<Redirect />} />
          
          {/* Layer 2: Authenticated User Dashboard (Protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          {/* Layer 3: Admin Panel (Protected + Admin Only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin User Details */}
          <Route path="/admin/user/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUserDetails />
            </ProtectedRoute>
          } />
          
          {/* Admin Link Editor */}
          <Route path="/admin/link/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLinkEditor />
            </ProtectedRoute>
          } />

          {/* Fallback for 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-slate-950 text-red-500 flex items-center justify-center">
              404 - Page Not Found
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}