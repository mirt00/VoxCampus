import api from "./axiosInstance";

export const getAllPosts = (params) => api.get("/posts", { params });
export const getPostById = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => api.post("/posts", data);
export const updatePost = (id, data) => api.patch(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
