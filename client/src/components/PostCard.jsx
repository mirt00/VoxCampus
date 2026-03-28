import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import VoteButton from "./VoteButton";
import Avatar from "./Avatar";
import PostMenu from "./PostMenu";
import { timeAgo } from "../utils/timeAgo";
import { useAuth } from "../hooks/useAuth";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const isAnon = post.author?.type === "anonymous";
  const isOwner = user && String(post.author?.userId) === String(user.id || user._id);

  const displayUser = isAnon
    ? { name: "Anonymous", avatar: null }
    : { name: post.author?.displayName || "User", avatar: post.author?.avatar || null };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 
                    hover:shadow-lg hover:-translate-y-0.5 
                    transition-all duration-300 ease-out
                    group">

      {/* Row 1 — Author + three dot */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {isAnon ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
              👤
            </div>
          ) : (
            <Avatar user={displayUser} size="md" />
          )}
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {isAnon ? "Anonymous" : displayUser.name}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <PostMenu postId={post._id} onEdit={() => window.location.href = `/post/${post._id}`} />
        )}
      </div>

      {/* Row 2 — Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {post.category?.name && (
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            {post.category.name}
          </span>
        )}
        <StatusBadge status={post.status} />
        {post.isEscalated && (
          <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-semibold animate-pulse">
            🔴 Escalated
          </span>
        )}
      </div>

      {/* Row 3 — Title + body */}
      <Link to={`/post/${post._id}`} className="block mb-3">
        <h3 className="font-extrabold text-gray-900 text-base leading-snug mb-1.5 
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {post.body}
        </p>
      </Link>

      {/* Row 4 — Image previews */}
      {post.attachments?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {post.attachments.slice(0, 3).map((src, i) => (
            <img key={i} src={src} alt=""
              className="w-20 h-20 object-cover rounded-xl border border-gray-100 hover:scale-105 transition-transform duration-200" />
          ))}
        </div>
      )}

      {/* Row 5 — Vote + View */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <VoteButton postId={post._id} voteCount={post.voteCount} />
        <Link to={`/post/${post._id}`}
          className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-1">
          Read more <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
        </Link>
      </div>
    </div>
  );
}
