import { useState } from "react";
import { useVote } from "../hooks/useVote";
import toast from "react-hot-toast";

export default function VoteButton({ postId, voteCount }) {
  const { mutate, isPending } = useVote();
  const [localCount, setLocalCount] = useState(voteCount);
  const [voted, setVoted] = useState(
    () => JSON.parse(localStorage.getItem("votes") || "{}")[postId] || false
  );

  const handleVote = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newVoted = !voted;
    const newCount = newVoted ? localCount + 1 : localCount - 1;
    setVoted(newVoted);
    setLocalCount(newCount);

    const votes = JSON.parse(localStorage.getItem("votes") || "{}");
    votes[postId] = newVoted;
    localStorage.setItem("votes", JSON.stringify(votes));

    mutate(postId, {
      onSuccess: (data) => {
        setLocalCount(data.data.voteCount);
        setVoted(data.data.voted);
        const v = JSON.parse(localStorage.getItem("votes") || "{}");
        v[postId] = data.data.voted;
        localStorage.setItem("votes", JSON.stringify(v));
      },
      onError: () => {
        setVoted(voted);
        setLocalCount(voteCount);
        toast.error("Could not vote");
      },
    });
  };

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold
                  transition-all duration-200 disabled:opacity-50 active:scale-95 select-none ${
        voted
          ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
          : "border-gray-200 bg-white text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5"
      }`}
    >
      {/* Arrow icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-4 h-4 transition-transform duration-200 ${voted ? "scale-110" : "group-hover:-translate-y-0.5"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 4l8 8H4l8-8z" />
      </svg>

      {/* Label */}
      <span>{voted ? "Upvoted" : "Upvote"}</span>

      {/* Count badge */}
      <span className={`min-w-[20px] text-center px-1.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
        voted ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary"
      }`}>
        {localCount}
      </span>
    </button>
  );
}
