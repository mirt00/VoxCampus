import api from "./axiosInstance";

export const loginApi = (data) => api.post("/auth/login", data);
export const registerApi = (data) => api.post("/auth/register", data);
export const logoutApi = () => api.post("/auth/logout");
export const getMeApi = () => api.get("/auth/me");
export const forgotPasswordApi = (data) => api.post("/auth/forgot-password", data);
export const resetPasswordApi = (token, data) => api.post(`/auth/reset-password/${token}`, data);
export const changePasswordApi = (data) => api.post("/auth/change-password", data);
