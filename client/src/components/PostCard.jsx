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
  // Use server-provided isOwner flag, fallback to client check
  const isOwner = post.isOwner || (user && String(post.author?.userId) === String(user.id || user._id));
  const isMyAnonPost = isOwner && isAnon;

  const displayUser = isAnon
    ? { name: "Anonymous", avatar: null }
    : { name: post.author?.displayName || "User", avatar: post.author?.avatar || null };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6
                    hover:shadow-lg hover:-translate-y-0.5
                    transition-all duration-300 ease-out
                    group">

      {/* Row 1 — Author + three dot */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          {isAnon ? (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${isMyAnonPost ? "bg-primary/20" : "bg-gradient-to-br from-gray-200 to-gray-300"}`}>
              👤
            </div>
          ) : (
            <Avatar user={displayUser} size="lg" />
          )}
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {isMyAnonPost ? (
                <span className="flex items-center gap-1.5">
                  <span>Anonymous</span>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>
                </span>
              ) : isAnon ? "Anonymous" : displayUser.name}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {isOwner && (
          <PostMenu postId={post._id} onEdit={() => window.location.href = `/post/${post._id}`} />
        )}
      </div>

      {/* Row 2 — Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-3.5">
        {post.category?.name && (
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
            {post.category.name}
          </span>
        )}
        <StatusBadge status={post.status} />
        {post.isEscalated && post.status === "pending" && (
          <span className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-full font-semibold animate-pulse">
            🔴 Escalated
          </span>
        )}
      </div>

      {/* Row 3 — Title + body */}
      <Link to={`/post/${post._id}`} className="block mb-4">
        <h3 className="font-extrabold text-gray-900 text-lg leading-snug mb-2
                       group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
          {post.body}
        </p>
      </Link>

      {/* Image previews — responsive grid */}
      {post.attachments?.length > 0 && (
        <div className={`mt-3 mb-3 gap-2 ${
          post.attachments.length === 1 ? "block" :
          post.attachments.length === 2 ? "grid grid-cols-2" :
          "grid grid-cols-2"
        }`}>
          {post.attachments.length === 1 && (
            <a href={post.attachments[0]} target="_blank" rel="noreferrer">
              <img src={post.attachments[0]} alt=""
                className="w-full max-h-64 object-cover rounded-xl border border-gray-100 hover:opacity-95 transition-opacity" />
            </a>
          )}
          {post.attachments.length === 2 && post.attachments.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer">
              <img src={src} alt=""
                className="w-full h-40 object-cover rounded-xl border border-gray-100 hover:opacity-95 transition-opacity" />
            </a>
          ))}
          {post.attachments.length >= 3 && (
            <>
              <a href={post.attachments[0]} target="_blank" rel="noreferrer" className="col-span-2">
                <img src={post.attachments[0]} alt=""
                  className="w-full h-48 object-cover rounded-xl border border-gray-100 hover:opacity-95 transition-opacity" />
              </a>
              <a href={post.attachments[1]} target="_blank" rel="noreferrer">
                <img src={post.attachments[1]} alt=""
                  className="w-full h-28 object-cover rounded-xl border border-gray-100 hover:opacity-95 transition-opacity" />
              </a>
              <a href={post.attachments[2]} target="_blank" rel="noreferrer" className="relative">
                <img src={post.attachments[2]} alt=""
                  className="w-full h-28 object-cover rounded-xl border border-gray-100 hover:opacity-95 transition-opacity" />
                {post.attachments.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">+{post.attachments.length - 3}</span>
                  </div>
                )}
              </a>
            </>
          )}
        </div>
      )}

      {/* Row 5 — Vote + View */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <VoteButton postId={post._id} voteCount={post.voteCount} />
        <Link to={`/post/${post._id}`}
          className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors duration-200 flex items-center gap-1">
          Read more <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">→</span>
        </Link>
      </div>
    </div>
  );
}
