import api from "./axiosInstance";

export const getAdminPosts = (params) => api.get("/admin/posts", { params });
export const updatePostStatus = (id, status) => api.patch(`/admin/posts/${id}/status`, { status });
export const assignAdmin = (id, adminId) => api.patch(`/admin/posts/${id}/assign`, { adminId });
export const saveAdminNote = (id, note) => api.patch(`/admin/posts/${id}/note`, { note });
export const saveAdminFeedback = (id, feedback) => api.patch(`/admin/posts/${id}/feedback`, { feedback });
export const getEscalationLog = (id) => api.get(`/admin/posts/${id}/escalation-log`);
export const getAdmins = () => api.get("/admin/users");
export const createAdmin = (data) => api.post("/admin/users", data);
export const deactivateAdmin = (id) => api.patch(`/admin/users/${id}/deactivate`);
