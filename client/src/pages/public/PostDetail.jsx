import { useParams } from "react-router-dom";
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
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
          <div className="flex items-start gap-4">
            <VoteButton postId={post._id} voteCount={post.voteCount} />
            <div className="flex-1">
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category?.name}</span>
                <StatusBadge status={post.status} />
                {post.isEscalated && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Escalated</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h1>
              <p className="text-gray-600 whitespace-pre-wrap">{post.body}</p>
              <p className="text-xs text-gray-400 mt-4">
                {post.author?.type === "anonymous" ? "Anonymous" : post.author?.displayName}
                {" · "}{timeAgo(post.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
