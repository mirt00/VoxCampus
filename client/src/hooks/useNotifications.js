import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications.api";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useNotifications(isLoggedIn) {
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    fetchNotifications()
      .then(setNotifications)
      .catch(() => {});

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("new-notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isLoggedIn]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return { notifications, unreadCount, markRead, markAllRead };
}
