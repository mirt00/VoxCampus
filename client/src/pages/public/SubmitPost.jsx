import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCreatePost } from "../../hooks/usePosts";
import { useAuth } from "../../hooks/useAuth";
import DuplicateWarning from "../../components/DuplicateWarning";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import api from "../../api/axiosInstance";

export default function SubmitPost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreatePost();
  const [form, setForm] = useState({ title: "", body: "", category: "" });
  const [anonymous, setAnonymous] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
      } catch (err) {
        console.error("Upload error:", err.response?.data || err.message);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setImages((prev) => [...prev, ...uploaded].slice(0, 3));
    setUploadingImages(false);
  };

  const CATEGORIES = [
    "Academic / Exam Issues",
    "Facilities / Maintenance",
    "Infrastructure / Burst Pipe",
    "Safety / Emergency",
    "Services / Admin",
    "General Suggestion",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If not logged in, always anonymous. If logged in, respect toggle.
    const authorType = (!user || anonymous) ? "anonymous" : "registered";
    try {
      await mutateAsync({ ...form, authorType, attachments: images });
      toast.success("Suggestion submitted!");
      navigate("/");
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicate(err.response.data.existingPostId);
      } else {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-primary mb-1">Share a Suggestion</h1>
            <p className="text-gray-500 text-sm mb-6">Help make our campus better. Your voice matters.</p>

            {duplicate && (
              <div className="mb-4">
                <DuplicateWarning postId={duplicate} onDismiss={() => setDuplicate(null)} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required maxLength={150} placeholder="Brief title of your suggestion"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={4} placeholder="Describe your suggestion in detail..."
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                  value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Images <span className="text-gray-400 font-normal">(optional, max 3)</span>
                </label>
                <label className={`flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors ${uploadingImages ? "border-primary bg-primary/5 cursor-wait" : "border-gray-200 hover:border-primary"}`}>
                  <span className="text-2xl">{uploadingImages ? "⏳" : "📎"}</span>
                  <span className="text-sm text-gray-500">
                    {uploadingImages ? "Uploading..." : "Click to upload images"}
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={handleImageChange} disabled={uploadingImages || images.length >= 3} />
                </label>
                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {images.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                        <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>                <select required
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Identity toggle */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3">Post as</p>
                {user ? (
                  <div className="flex gap-3">
                    {/* Named */}
                    <button type="button"
                      onClick={() => setAnonymous(false)}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                        !anonymous ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <Avatar user={user} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">Your name is visible</p>
                      </div>
                      {!anonymous && <span className="ml-auto text-primary text-lg">✓</span>}
                    </button>

                    {/* Anonymous */}
                    <button type="button"
                      onClick={() => setAnonymous(true)}
                      className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                        anonymous ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center flex-shrink-0 text-lg">
                        👤
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Anonymous</p>
                        <p className="text-xs text-gray-400">Your identity is hidden</p>
                      </div>
                      {anonymous && <span className="ml-auto text-primary text-lg">✓</span>}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 border border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-lg">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">Posting anonymously</p>
                      <p className="text-xs text-gray-400">
                        <Link to="/login" className="text-primary hover:underline">Login</Link> or{" "}
                        <Link to="/register" className="text-primary hover:underline">sign up</Link> to post with your name
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" disabled={isPending || uploadingImages}
                className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary-light transition-colors font-semibold disabled:opacity-60">
                {uploadingImages ? "Uploading images..." : isPending ? "Submitting..." : "Submit Suggestion"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
