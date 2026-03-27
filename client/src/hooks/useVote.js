import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upvotePost } from "../api/votes.api";

export const useVote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upvotePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
};
