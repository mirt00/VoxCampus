import { useParams, Link, useNavigate } from "react-router-dom";
import { usePost } from "../../hooks/usePosts";
import StatusBadge from "../../components/StatusBadge";
import VoteButton from "../../components/VoteButton";
import Navbar from "../../components/Navbar";
import { timeAgo } from "../../utils/timeAgo";

export default function PostDetail() {
  const { id } = useParams();
  const { data: post, isLoading } = usePost(id);

  if (isLoading) return <><Navbar /><p className="text-center py-20 text-gray-400">Loading...</p></>;
  if (!post) return <><Navbar /><p className="text-center py-20 text-gray-400">Post not found.</p></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Feed
          </Link>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category?.name}</span>
              <StatusBadge status={post.status} />
              {post.isEscalated && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Escalated</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap text-sm">{post.body}</p>

            {post.attachments?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.attachments.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-32 h-32 object-cover rounded-lg border" />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400">
                {post.author?.type === "anonymous" ? "Anonymous" : post.author?.displayName}
                {" · "}{timeAgo(post.createdAt)}
              </p>
              <VoteButton postId={post._id} voteCount={post.voteCount} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
