import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Avatar from "./Avatar";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <nav className="bg-primary text-white px-6 py-3 flex items-center justify-between shadow-md print:hidden">
      <Link to="/" className="text-xl font-bold tracking-wide">🎓 VoxCampus</Link>

      <div className="flex items-center gap-3 text-sm">
        <Link to="/submit"
          className="bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
          + Submit
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar user={user} size="sm" />
              <span className="text-blue-100 hidden sm:block text-xs">{user.name}</span>
            </Link>
            <button onClick={handleLogout}
              className="border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              Login
            </Link>
            <Link to="/register"
              className="bg-white text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
