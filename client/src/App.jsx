import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Feed from "./pages/public/Feed";
import SubmitPost from "./pages/public/SubmitPost";
import PostDetail from "./pages/public/PostDetail";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import Profile from "./pages/public/Profile";
import ChangePassword from "./pages/public/ChangePassword";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminForgotPassword from "./pages/admin/ForgotPassword";
import AdminResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import PostDetailAdmin from "./pages/admin/PostDetailAdmin";
import ManageAdmins from "./pages/admin/ManageAdmins";
import AdminChangePassword from "./pages/admin/ChangePassword";
import QRPage from "./pages/admin/QRPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Feed />} />
        <Route path="/submit" element={<SubmitPost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />

        {/* Protected Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin", "superadmin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/post/:id" element={<ProtectedRoute roles={["admin", "superadmin"]}><PostDetailAdmin /></ProtectedRoute>} />
        <Route path="/admin/manage-admins" element={<ProtectedRoute roles={["superadmin"]}><ManageAdmins /></ProtectedRoute>} />
        <Route path="/admin/change-password" element={<ProtectedRoute roles={["admin", "superadmin"]}><AdminChangePassword /></ProtectedRoute>} />
        <Route path="/admin/qr" element={<ProtectedRoute roles={["admin", "superadmin"]}><QRPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
