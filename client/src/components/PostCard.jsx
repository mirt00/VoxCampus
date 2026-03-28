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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">

      {/* Top row — avatar + meta + three dot */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {isAnon ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-base flex-shrink-0">
              👤
            </div>
          ) : (
            <Avatar user={displayUser} size="md" />
          )}
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-800 block truncate">
              {isAnon ? "Anonymous" : displayUser.name}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {post.category?.name && (
            <span className="hidden sm:block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {post.category.name}
            </span>
          )}
          <StatusBadge status={post.status} />
          {post.isEscalated && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">🔴</span>
          )}
          {isOwner && <PostMenu postId={post._id} onEdit={() => window.location.href = `/post/${post._id}`} />}
        </div>
      </div>

      {/* Category chip on mobile */}
      {post.category?.name && (
        <span className="sm:hidden inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium mb-2">
          {post.category.name}
        </span>
      )}

      {/* Title + body */}
      <Link to={`/post/${post._id}`} className="block group">
        <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-1 mb-1 text-[15px]">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.body}</p>
      </Link>

      {/* Image previews */}
      {post.attachments?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {post.attachments.slice(0, 3).map((src, i) => (
            <img key={i} src={src} alt="" className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-100" />
          ))}
        </div>
      )}

      {/* Bottom row — vote */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <VoteButton postId={post._id} voteCount={post.voteCount} />
        <Link to={`/post/${post._id}`} className="text-xs text-gray-400 hover:text-primary transition-colors">
          View →
        </Link>
      </div>
    </div>
  );
}
