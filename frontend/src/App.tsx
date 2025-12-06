import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login"; // 👈 Import the real Login page
import Register from "@/pages/public/Register";

// 🚧 Placeholders for pages coming next
const Dashboard = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <h1 className="text-2xl">👤 User Dashboard (Coming Soon)</h1>
  </div>
);

const AdminPanel = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <h1 className="text-2xl">🛡️ Admin Panel (Coming Soon)</h1>
  </div>
);



export default function App() {
  return (
    <Router>
      <Routes>
        {/* Layer 1: Public Guest Access */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Layer 2: Authenticated User Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Layer 3: Admin Panel */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Fallback for 404 */}
        <Route path="*" element={
          <div className="min-h-screen bg-slate-950 text-red-500 flex items-center justify-center">
            404 - Page Not Found
          </div>
        } />
      </Routes>
    </Router>
  );
}