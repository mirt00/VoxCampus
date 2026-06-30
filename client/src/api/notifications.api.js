import api from "./axiosInstance";

export const fetchNotifications = () => api.get("/notifications").then(r => r.data);
export const fetchUnreadCount = () => api.get("/notifications/unread-count").then(r => r.data);
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`).then(r => r.data);
export const markAllNotificationsRead = () => api.patch("/notifications/read-all").then(r => r.data);
