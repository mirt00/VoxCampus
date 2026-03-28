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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 disabled:opacity-50 active:scale-95 ${
        voted
          ? "bg-primary text-white shadow-sm shadow-primary/30"
          : "bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l8 8H4l8-8z" />
      </svg>
      <span>{localCount}</span>
    </button>
  );
}
