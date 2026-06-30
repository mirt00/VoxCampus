import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../hooks/useNotifications";
import Avatar from "./Avatar";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const STATUS_ICONS = {
  resolved: "✅",
  "in-progress": "🔄",
  rejected: "❌",
  pending: "⏳",
};

export default function Navbar() {
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
    toast.success("Logged out");
    navigate("/");
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markRead(n._id);
    setOpen(false);
    navigate(`/post/${n.post}`);
  };

  return (
    <nav className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md print:hidden">
      <Link to="/feed" className="text-lg font-bold tracking-wide">🎓 VoxCampus</Link>

      <div className="flex items-center gap-2 text-sm">
        <Link to="/submit"
          className="bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-xs sm:text-sm">
          + Submit
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Avatar user={user} size="sm" />
              <span className="text-blue-100 hidden sm:block text-xs">{user.name}</span>
            </Link>

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
                  <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-8 text-center">
                        <div className="text-3xl mb-2">🔕</div>
                        <p className="text-gray-400 text-sm">No notifications yet</p>
                        <p className="text-gray-300 text-xs mt-1">You'll be notified when your suggestion is updated</p>
                      </li>
                    ) : (
                      notifications.map((n) => (
                        <li
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                              {STATUS_ICONS[n.newStatus] || "📢"}
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

                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t bg-gray-50 text-center">
                      <Link to="/feed" onClick={() => setOpen(false)} className="text-xs text-primary hover:underline font-medium">
                        View all posts →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleLogout}
              className="border border-white/30 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Link to="/login"
              className="border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs">
              Login
            </Link>
            <Link to="/register"
              className="bg-white text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-medium text-xs">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
