import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect to login if a protected admin route returns 401
    // Don't redirect on /auth/me — that's just the initial session check
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/me")) {
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export default api;
