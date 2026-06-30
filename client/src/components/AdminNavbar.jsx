import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(!!user);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    navigate(`/admin/post/${n.post}`);
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 flex items-center justify-between shadow-md print:hidden">
      <Link to="/admin/dashboard" className="text-xl font-bold">🎓 VoxCampus Admin</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/admin/dashboard" className="hover:text-accent">Dashboard</Link>
        {user?.role === "superadmin" && (
          <Link to="/admin/manage-admins" className="hover:text-accent">Manage Admins</Link>
        )}
        <Link to="/admin/reports" className="hover:text-accent">Reports</Link>
        <Link to="/admin/qr" className="hover:text-accent">QR Code</Link>
        <Link to="/admin/change-password" className="hover:text-accent">Password</Link>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="relative p-1 rounded hover:text-accent transition-colors"
            aria-label="Notifications"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-gray-400 text-sm">No notifications yet</li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          📋
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{n.postTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-primary font-medium mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <span className="text-blue-200 text-xs">{user?.name}</span>
        <button onClick={handleLogout} className="bg-accent px-3 py-1 rounded hover:bg-yellow-600 transition-colors">
          Logout
        </button>
      </div>
    </nav>
  );
}
