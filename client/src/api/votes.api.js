import api from "./axiosInstance";

export const upvotePost = (postId) => api.post(`/votes/${postId}`);
