import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md print:hidden">
      <Link to="/admin/dashboard" className="text-xl font-bold">🎓 VoxCampus Admin</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/admin/dashboard" className="hover:text-accent">Dashboard</Link>
        {user?.role === "superadmin" && (
          <Link to="/admin/manage-admins" className="hover:text-accent">Manage Admins</Link>
        )}
        <Link to="/admin/qr" className="hover:text-accent">QR Code</Link>
        <Link to="/admin/change-password" className="hover:text-accent">Password</Link>
        <span className="text-blue-200 text-xs">{user?.name}</span>
        <button onClick={handleLogout} className="bg-accent px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
