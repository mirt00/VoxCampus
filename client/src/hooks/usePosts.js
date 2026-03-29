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
    // Optimistic update — add post to feed immediately
    onMutate: async (newPost) => {
      await qc.cancelQueries({ queryKey: ["posts"] });
      const previous = qc.getQueriesData({ queryKey: ["posts"] });
      qc.setQueriesData({ queryKey: ["posts"] }, (old) => {
        if (!Array.isArray(old)) return old;
        const optimistic = {
          _id: `temp-${Date.now()}`,
          title: newPost.title,
          body: newPost.body,
          voteCount: 0,
          status: "pending",
          createdAt: new Date().toISOString(),
          author: { type: newPost.authorType, displayName: "You" },
          attachments: newPost.attachments || [],
        };
        return [optimistic, ...old];
      });
      return { previous };
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};
