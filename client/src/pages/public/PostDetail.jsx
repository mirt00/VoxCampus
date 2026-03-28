import { useParams, Link } from "react-router-dom";
import { usePost } from "../../hooks/usePosts";
import StatusBadge from "../../components/StatusBadge";
import VoteButton from "../../components/VoteButton";
import Avatar from "../../components/Avatar";
import Navbar from "../../components/Navbar";
import { timeAgo } from "../../utils/timeAgo";

export default function PostDetail() {
  const { id } = useParams();
  const { data: post, isLoading } = usePost(id);

  if (isLoading) return <><Navbar /><p className="text-center py-20 text-gray-400">Loading...</p></>;
  if (!post) return <><Navbar /><p className="text-center py-20 text-gray-400">Post not found.</p></>;

  const isAnon = post.author?.type === "anonymous";
  const displayUser = isAnon
    ? { name: "Anonymous", avatar: null }
    : { name: post.author?.displayName || "User", avatar: post.author?.avatar || null };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Back button */}
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Feed
          </Link>

          {/* Post card — same layout as PostCard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

            {/* Top row — avatar + name + time + badges */}
            <div className="flex items-center gap-3 mb-4">
              {isAnon ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0">👤</div>
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
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">Escalated</span>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h1>

            {/* Full body */}
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{post.body}</p>

            {/* Image attachments */}
            {post.attachments?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.attachments.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="" className="w-28 h-28 sm:w-40 sm:h-40 object-cover rounded-xl border hover:opacity-90 transition-opacity" />
                  </a>
                ))}
              </div>
            )}

            {/* Bottom row — vote button */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
              <VoteButton postId={post._id} voteCount={post.voteCount} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
