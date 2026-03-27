import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPosts, getPostById, createPost } from "../api/posts.api";

export const usePosts = (params) =>
  useQuery({
    queryKey: ["posts", params],
    queryFn: () => getAllPosts(params).then((r) => r.data),
  });

export const usePost = (id) =>
  useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postData) => createPost(postData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};
