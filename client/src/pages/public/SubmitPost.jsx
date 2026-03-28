import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreatePost } from "../../hooks/usePosts";
import { usePosts } from "../../hooks/usePosts";
import { useAuth } from "../../hooks/useAuth";
import DuplicateWarning from "../../components/DuplicateWarning";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import PostCard from "../../components/PostCard";
import api from "../../api/axiosInstance";

const CATEGORIES = [
  "Academic / Exam Issues",
  "Facilities / Maintenance",
  "Infrastructure / Burst Pipe",
  "Safety / Emergency",
  "Services / Admin",
  "General Suggestion",
];

export default function SubmitPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreatePost();
  const { data: recentPosts = [] } = usePosts({ feed: "latest" });
  const [form, setForm] = useState({ title: "", body: "", category: "" });
  const [anonymous, setAnonymous] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - images.length);
    if (!files.length) return;
    setUploadingImages(true);
    const uploaded = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const { data } = await api.post("/upload/post-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push(data.url);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setImages((prev) => [...prev, ...uploaded].slice(0, 3));
    setUploadingImages(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authorType = (!user || anonymous) ? "anonymous" : "registered";
    try {
      await mutateAsync({ ...form, authorType, attachments: images });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicate(err.response.data.existingPostId);
      } else {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-primary to-primary-light px-4 pt-10 pb-16 text-white text-center">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-2xl font-bold">VoxCampus</h1>
        </div>
        <div className="px-4 -mt-8 pb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Posted!</h2>
            <p className="text-gray-400 text-sm mb-6">Your suggestion has been shared with the campus.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ title: "", body: "", category: "" });
                  setImages([]);
                  setAnonymous(false);
                }}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                + Post Another Suggestion
              </button>
              <button onClick={() => navigate("/")}
                className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50">
                View Feed
              </button>
            </div>
          </div>

          {/* Recent posts below */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">Recent Suggestions</h3>
              <button onClick={() => navigate("/")} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile hero header */}
      <div className="bg-gradient-to-r from-primary to-primary-light px-4 pt-10 pb-16 text-white text-center">
        <div className="text-4xl mb-2">🎓</div>
        <h1 className="text-2xl font-bold">VoxCampus</h1>
        <p className="text-blue-200 text-sm mt-1">Your voice shapes our campus</p>
        {!user && (
          <div className="flex gap-2 justify-center mt-4">
            <Link to="/login" className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm hover:bg-white/30 transition-colors">
              Login
            </Link>
            <Link to="/register" className="bg-accent text-white px-4 py-1.5 rounded-full text-sm hover:bg-yellow-600 transition-colors font-medium">
              Sign up
            </Link>
          </div>
        )}
        {user && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Avatar user={user} size="sm" />
            <span className="text-blue-100 text-sm">Hi, {user.name}</span>
          </div>
        )}
      </div>

      {/* Form card — overlaps hero */}
      <div className="px-4 -mt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-primary mb-1">Share a Suggestion</h2>
          <p className="text-gray-400 text-xs mb-4">Help make our campus better.</p>

          {duplicate && (
            <div className="mb-4">
              <DuplicateWarning postId={duplicate} onDismiss={() => setDuplicate(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input type="text" required maxLength={150} placeholder="Title of your suggestion"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <textarea required rows={3} placeholder="Describe your suggestion..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-gray-50"
                value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>

            <div>
              <select required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 cursor-pointer"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Image upload */}
            <div>
              <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${uploadingImages ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary"}`}>
                <span className="text-xl">{uploadingImages ? "⏳" : "📷"}</span>
                <span className="text-sm text-gray-400">{uploadingImages ? "Uploading..." : "Add photos (optional)"}</span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={handleImageChange} disabled={uploadingImages || images.length >= 3} />
              </label>
              {images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Identity toggle */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">POST AS</p>
              {user ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAnonymous(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-colors ${!anonymous ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <Avatar user={user} size="sm" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400">Named</p>
                    </div>
                    {!anonymous && <span className="ml-auto text-primary text-sm">✓</span>}
                  </button>
                  <button type="button" onClick={() => setAnonymous(true)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-colors ${anonymous ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-800">Anonymous</p>
                      <p className="text-xs text-gray-400">Hidden</p>
                    </div>
                    {anonymous && <span className="ml-auto text-primary text-sm">✓</span>}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Posting anonymously</p>
                    <p className="text-xs text-gray-400">
                      <Link to="/login" className="text-primary">Login</Link> or{" "}
                      <Link to="/register" className="text-primary">sign up</Link> to use your name
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={isPending || uploadingImages}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-60 transition-colors active:scale-95">
              {uploadingImages ? "Uploading..." : isPending ? "Posting..." : "📢 Post Suggestion"}
            </button>
          </form>
        </div>

        {/* Recent posts section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700">Recent Suggestions</h3>
            <Link to="/" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentPosts.slice(0, 3).map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {recentPosts.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No suggestions yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
