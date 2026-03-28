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
  const isOwner = user && post.author?.userId === user.id;

  const anonUser = { name: "Anonymous", avatar: null };
  const displayUser = isAnon
    ? anonUser
    : { name: post.author?.displayName || "User", avatar: post.author?.avatar || null };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">

      {/* Top row — avatar + name + time + badges */}
      <div className="flex items-center gap-3 mb-3">
        {isAnon ? (
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-base flex-shrink-0">
            👤
          </div>
        ) : (
          <Avatar user={displayUser} size="md" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">
              {isAnon ? "Anonymous" : displayUser.name}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {post.category?.name || post.category}
            </span>
            <StatusBadge status={post.status} />
            {post.isEscalated && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                Escalated
              </span>
            )}
          </div>
        </div>
        {isOwner && (
          <PostMenu postId={post._id} onEdit={() => window.location.href = `/post/${post._id}`} />
        )}
      </div>

      {/* Title + body */}
      <Link to={`/post/${post._id}`} className="block group">
        <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2">{post.body}</p>
      </Link>

      {/* Image previews */}
      {post.attachments?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {post.attachments.slice(0, 3).map((src, i) => (
            <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
          ))}
        </div>
      )}

      {/* Bottom row — vote button */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
        <VoteButton postId={post._id} voteCount={post.voteCount} />
      </div>
    </div>
  );
}
