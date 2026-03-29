import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { usePost } from "../../hooks/usePosts";
import { updatePost } from "../../api/posts.api";
import { useQueryClient } from "@tanstack/react-query";
import StatusBadge from "../../components/StatusBadge";
import VoteButton from "../../components/VoteButton";
import Avatar from "../../components/Avatar";
import PostMenu from "../../components/PostMenu";
import Navbar from "../../components/Navbar";
import { timeAgo } from "../../utils/timeAgo";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Academic / Exam Issues", "Facilities / Maintenance",
  "Infrastructure / Burst Pipe", "Safety / Emergency",
  "Services / Admin", "General Suggestion",
];

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: post, isLoading } = usePost(id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <><Navbar /><p className="text-center py-20 text-gray-400">Loading...</p></>;
  if (!post) return <><Navbar /><p className="text-center py-20 text-gray-400">Post not found.</p></>;

  const isAnon = post.author?.type === "anonymous";
  const displayUser = isAnon
    ? { name: "Anonymous", avatar: null }
    : { name: post.author?.displayName || "User", avatar: post.author?.avatar || null };

  const isOwner = post.isOwner || (user && String(post.author?.userId) === String(user.id || user._id));
  const isMyAnonPost = isOwner && isAnon;

  const startEdit = () => {
    setForm({ title: post.title, body: post.body, category: post.category?.name || "" });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await updatePost(id, form);
      qc.invalidateQueries({ queryKey: ["post", id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      setEditing(false);
      toast.success("Post updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deletePost(id);
      qc.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
            ← Back to Feed
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {/* Top row */}
            <div className="flex items-center gap-3 mb-4">
              {isAnon ? (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0">👤</div>
              ) : (
                <Avatar user={displayUser} size="md" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">
                    {isMyAnonPost ? (
                      <span className="flex items-center gap-1.5">
                        Anonymous
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>
                      </span>
                    ) : isAnon ? "Anonymous" : displayUser.name}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {post.category && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {post.category?.name}
                    </span>
                  )}
                  <StatusBadge status={post.status} />
                  {post.isEscalated && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">Escalated</span>
                  )}
                </div>
              </div>

              {/* Three dot menu for owner */}
              {isOwner && !editing && (
                <PostMenu postId={post._id} onEdit={startEdit} />
              )}
            </div>

            {/* Edit form */}
            {editing ? (
              <div className="space-y-3">
                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea rows={4} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">No category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-light disabled:opacity-60">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h1>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{post.body}</p>

                {post.attachments?.length > 0 && (
                  <div className={`mt-4 gap-2 ${
                    post.attachments.length === 1 ? "block" : "grid grid-cols-2"
                  }`}>
                    {post.attachments.length === 1 && (
                      <a href={post.attachments[0]} target="_blank" rel="noreferrer">
                        <img src={post.attachments[0]} alt=""
                          className="w-full max-h-80 object-cover rounded-xl border hover:opacity-95 transition-opacity" />
                      </a>
                    )}
                    {post.attachments.length === 2 && post.attachments.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt=""
                          className="w-full h-48 object-cover rounded-xl border hover:opacity-95 transition-opacity" />
                      </a>
                    ))}
                    {post.attachments.length >= 3 && (
                      <>
                        <a href={post.attachments[0]} target="_blank" rel="noreferrer" className="col-span-2">
                          <img src={post.attachments[0]} alt=""
                            className="w-full h-56 object-cover rounded-xl border hover:opacity-95 transition-opacity" />
                        </a>
                        {post.attachments.slice(1, 3).map((src, i) => (
                          <a key={i} href={src} target="_blank" rel="noreferrer" className="relative">
                            <img src={src} alt=""
                              className="w-full h-36 object-cover rounded-xl border hover:opacity-95 transition-opacity" />
                            {i === 1 && post.attachments.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">+{post.attachments.length - 3}</span>
                              </div>
                            )}
                          </a>
                        ))}
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                  <VoteButton postId={post._id} voteCount={post.voteCount} />
                </div>

                {/* Admin public response */}
                {post.adminFeedback && (
                  <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        A
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">Campus Administration</p>
                        <p className="text-xs text-gray-400">Official Response</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{post.adminFeedback}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Delete confirmation handled by PostMenu */}
        </div>
      </div>
    </>
  );
}
