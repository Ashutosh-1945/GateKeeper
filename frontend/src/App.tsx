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
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CinematicOverlay } from "@/components/ui/CinematicEffects";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        {/* Cinematic Effects Overlay */}
        <CinematicOverlay 
          enableScanlines={true}
          enableGrain={true}
          enableSpores={true}
          enableVignette={true}
          sporeCount={10}
        />
        
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
              <div className="min-h-screen bg-background text-gate-red flex items-center justify-center font-display text-2xl">
                <span className="text-glow">404</span>
                <span className="mx-4 text-muted-foreground">—</span>
                <span>Page Not Found</span>
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}