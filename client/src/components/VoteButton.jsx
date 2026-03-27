import { useState } from "react";
import { useVote } from "../hooks/useVote";
import toast from "react-hot-toast";

export default function VoteButton({ postId, voteCount }) {
  const { mutate, isPending } = useVote();
  const [voted, setVoted] = useState(
    () => JSON.parse(localStorage.getItem("votes") || "{}")[postId] || false
  );

  const handleVote = () => {
    mutate(postId, {
      onSuccess: () => {
        const votes = JSON.parse(localStorage.getItem("votes") || "{}");
        votes[postId] = !voted;
        localStorage.setItem("votes", JSON.stringify(votes));
        setVoted(!voted);
      },
      onError: (err) => toast.error(err.response?.data?.message || "Could not vote"),
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-sm font-semibold transition-all disabled:opacity-50 ${
        voted
          ? "border-primary bg-primary text-white"
          : "border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l8 8H4l8-8z" />
      </svg>
      <span>{voted ? "Voted" : "Upvote"}</span>
      <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${voted ? "bg-white/20" : "bg-gray-100"}`}>
        {voteCount}
      </span>
    </button>
  );
}
