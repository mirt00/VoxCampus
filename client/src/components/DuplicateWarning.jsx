import { Link } from "react-router-dom";

export default function DuplicateWarning({ postId, onDismiss }) {
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm text-yellow-800">
      <p className="font-semibold mb-1">A similar post already exists.</p>
      <p>
        Instead of creating a duplicate, please{" "}
        <Link to={`/post/${postId}`} className="underline font-medium">
          upvote the existing post
        </Link>{" "}
        to show your support.
      </p>
      <button onClick={onDismiss} className="mt-2 text-xs text-yellow-600 hover:underline">
        Dismiss
      </button>
    </div>
  );
}
