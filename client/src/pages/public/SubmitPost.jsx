import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreatePost, usePosts } from "../../hooks/usePosts";
import { useAuth } from "../../hooks/useAuth";
import DuplicateWarning from "../../components/DuplicateWarning";
import ModerationWarning from "../../components/ModerationWarning";
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
  const [anonymous, setAnonymous] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [moderation, setModeration] = useState(null); // { reason, matched, layer }
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, dirtyFields },
  } = useForm({
    mode: "onChange",
    defaultValues: { title: "", body: "", category: "" },
  });

  const titleValue = watch("title") || "";
  const bodyValue = watch("body") || "";

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

  const onSubmit = async (data) => {
    const authorType = (!user || anonymous) ? "anonymous" : "registered";
    setModeration(null); // clear previous moderation warning
    try {
      await mutateAsync({ ...data, authorType, attachments: images });
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setDuplicate(err.response.data.existingPostId);
      } else if (err.response?.status === 422 && err.response.data?.blocked) {
        // Moderation block — keep form, show warning, don't navigate
        setModeration({
          reason: err.response.data.reason,
          matched: err.response.data.matched,
          layer: err.response.data.layer,
        });
      } else {
        toast.error(err.response?.data?.message || "Submission failed");
      }
    }
  };

  const inputBase = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50";
  const inputOk = `${inputBase} border-gray-200 focus:ring-primary/30 focus:border-primary`;
  const inputErr = `${inputBase} border-red-400 focus:ring-red-200 bg-red-50`;

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
              <button onClick={() => { setSubmitted(false); reset(); setImages([]); setAnonymous(false); }}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                + Post Another Suggestion
              </button>
              <button onClick={() => navigate("/feed")}
                className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50">
                View Feed
              </button>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700">Recent Suggestions</h3>
              <button onClick={() => navigate("/feed")} className="text-xs text-primary hover:underline">View all →</button>
            </div>
            <div className="space-y-3">
              {recentPosts.slice(0, 3).map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-primary-light px-4 pt-10 pb-16 text-white text-center">
        <div className="text-4xl mb-2">🎓</div>
        <h1 className="text-2xl font-bold">VoxCampus</h1>
        <p className="text-blue-200 text-sm mt-1">Your voice shapes our campus</p>
        {user && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <Avatar user={user} size="sm" />
            <span className="text-blue-100 text-sm">Hi, {user.name}</span>
          </div>
        )}
      </div>

      <div className="px-4 -mt-8 pb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-bold text-primary mb-1">Share a Suggestion</h2>
          <p className="text-gray-400 text-xs mb-4">Help make our campus better.</p>

          {duplicate && (
            <div className="mb-4">
              <DuplicateWarning postId={duplicate} onDismiss={() => setDuplicate(null)} />
            </div>
          )}

          {moderation && (
            <div className="mb-4">
              <ModerationWarning
                reason={moderation.reason}
                matched={moderation.matched}
                layer={moderation.layer}
                onDismiss={() => setModeration(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Title <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs ${titleValue.length > 130 ? "text-red-400" : "text-gray-400"}`}>
                  {titleValue.length}/150
                </span>
              </div>
              <input type="text" placeholder="Brief title of your suggestion"
                className={errors.title ? inputErr : inputOk}
                {...register("title", {
                  required: "Title is required",
                  validate: v => v.trim().length >= 3 || "Title must be at least 3 characters",
                  maxLength: { value: 150, message: "Title cannot exceed 150 characters" },
                })}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {errors.title.message}</p>
              )}
            </div>

            {/* Body */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Description <span className="text-red-400">*</span>
                </label>
                <span className={`text-xs ${bodyValue.length > 1800 ? "text-red-400" : "text-gray-400"}`}>
                  {bodyValue.length}/2000
                </span>
              </div>
              <textarea rows={3} placeholder="Describe your suggestion in detail..."
                className={`${errors.body ? inputErr : inputOk} resize-none`}
                {...register("body", {
                  required: "Description is required",
                  validate: v => v.trim().length >= 3 || "Description must be at least 3 characters",
                  maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" },
                })}
              />
              {errors.body && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {errors.body.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <div className="relative">
                <select className={`${inputOk} appearance-none cursor-pointer pr-10`}
                  {...register("category")}>
                  <option value="">Select category (optional)</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Photos <span className="text-gray-400 font-normal text-xs">(optional, max 3)</span>
              </label>
              <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                uploadingImages ? "border-primary bg-primary/5 cursor-wait" : images.length >= 3 ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50" : "border-gray-200 hover:border-primary"
              }`}>
                <span className="text-xl">{uploadingImages ? "⏳" : "📷"}</span>
                <span className="text-sm text-gray-400">
                  {uploadingImages ? "Uploading..." : images.length >= 3 ? "Max 3 photos reached" : "Click to add photos"}
                </span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={handleImageChange} disabled={uploadingImages || images.length >= 3} />
              </label>
              {images.length > 0 && (
                <div className={`mt-2 gap-2 ${images.length === 1 ? "block" : "grid grid-cols-3"}`}>
                  {images.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt="" className="w-full h-24 object-cover rounded-xl border" />
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Identity toggle */}
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Post as</p>
              {user ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAnonymous(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${!anonymous ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                    <Avatar user={user} size="sm" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400">Named</p>
                    </div>
                    {!anonymous && <span className="ml-auto text-primary text-sm font-bold">✓</span>}
                  </button>
                  <button type="button" onClick={() => setAnonymous(true)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${anonymous ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-800">Anonymous</p>
                      <p className="text-xs text-gray-400">Hidden</p>
                    </div>
                    {anonymous && <span className="ml-auto text-primary text-sm font-bold">✓</span>}
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

            {/* Submit */}
            <button type="submit"
              disabled={!isValid || isPending || uploadingImages}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-primary-light transition-all active:scale-[0.98]
                         shadow-sm shadow-primary/30">
              {uploadingImages ? "Uploading photos..." : isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Posting...
                </span>
              ) : "📢 Post Suggestion"}
            </button>

            {/* Hint when button is disabled */}
            {!isValid && (dirtyFields.title || dirtyFields.body) && (
              <p className="text-center text-xs text-gray-400">Fill in all required fields to post</p>
            )}
          </form>
        </div>

        {/* Recent posts */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700">Recent Suggestions</h3>
            <Link to="/feed" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentPosts.slice(0, 3).map((post) => <PostCard key={post._id} post={post} />)}
            {recentPosts.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-4">No suggestions yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
