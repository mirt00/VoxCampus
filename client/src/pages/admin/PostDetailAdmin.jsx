import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEscalationLog, saveAdminNote, updatePostStatus, saveAdminFeedback } from "../../api/admin.api";
import { getPostById } from "../../api/posts.api";
import api from "../../api/axiosInstance";
import AdminNavbar from "../../components/AdminNavbar";
import StatusBadge from "../../components/StatusBadge";
import { timeAgo } from "../../utils/timeAgo";
import toast from "react-hot-toast";

const STATUSES = ["pending", "in-progress", "resolved", "rejected"];

export default function PostDetailAdmin() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const feedbackRef = useRef(null);
  const [feedbackImages, setFeedbackImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const initialLoadDone = useRef(false);

  const { data: post } = useQuery({ queryKey: ["post", id], queryFn: () => getPostById(id).then((r) => r.data) });
  const { data: logs = [] } = useQuery({ queryKey: ["escalationLog", id], queryFn: () => getEscalationLog(id).then((r) => r.data) });

  useEffect(() => {
    if (post?.adminFeedbackImages && !initialLoadDone.current) {
      setFeedbackImages(post.adminFeedbackImages);
      initialLoadDone.current = true;
    }
  }, [post?.adminFeedbackImages]);

  const { mutate: submitNote } = useMutation({
    mutationFn: () => saveAdminNote(id, note),
    onSuccess: () => { toast.success("Note saved"); qc.invalidateQueries({ queryKey: ["post", id] }); },
  });

  const { mutateAsync: submitFeedback } = useMutation({
    mutationFn: ({ fbText, fbImages }) => saveAdminFeedback(id, fbText, fbImages),
    onSuccess: () => { toast.success("Feedback published"); qc.invalidateQueries({ queryKey: ["post", id] }); },
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (status) => updatePostStatus(id, status),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["post", id] }); },
  });

  const handleFeedbackImageUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - feedbackImages.length);
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
    setFeedbackImages((prev) => [...prev, ...uploaded].slice(0, 5));
    setUploadingImages(false);
  };

  const handlePublishFeedback = () => {
    const fbText = feedbackRef.current?.value || "";
    submitFeedback({ fbText, fbImages: feedbackImages });
    setFeedbackImages([]);
  };

  if (!post) return <><AdminNavbar /><p className="text-center py-20 text-gray-400">Loading...</p></>;

  const isAnon = post.author?.type === "anonymous";

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-3xl mx-auto space-y-4">

          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary">
            ← Back to Dashboard
          </Link>

          {/* Post card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              {isAnon ? (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
              ) : post.author?.avatar ? (
                <img src={post.author.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold">
                  {post.author?.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">
                  {isAnon ? "Anonymous User" : post.author?.displayName}
                </p>
                <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                {isAnon && (
                  <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    🔒 Identity hidden from public
                  </span>
                )}
                {isAnon && post.author?.realIdentity && (
                  <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-xs font-bold text-amber-700 mb-1">🔍 Real Identity (Admin Only)</p>
                    <div className="flex items-center gap-2">
                      {post.author.realIdentity.avatar ? (
                        <img src={post.author.realIdentity.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                          {post.author.realIdentity.name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{post.author.realIdentity.name}</p>
                        <p className="text-xs text-gray-500">{post.author.realIdentity.email}</p>
                        {post.author.realIdentity.faculty && (
                          <p className="text-xs text-gray-400">{post.author.realIdentity.faculty}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <select value={post.status}
                onChange={(e) => changeStatus(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category?.name}</span>
              <StatusBadge status={post.status} />
              {post.isEscalated && post.status === "pending" && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">🔴 Escalated</span>}
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">▲ {post.voteCount} votes</span>
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap text-sm">{post.body}</p>

            {post.attachments?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {post.attachments.map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="" className="w-24 h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Public feedback */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📢</span>
              <h2 className="font-semibold text-gray-700">Public Admin Response</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Visible to all users</span>
            </div>

            {post.adminFeedback && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                <p className="font-medium text-primary text-xs mb-1">Current response:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.adminFeedback}</p>
                {post.adminFeedbackImages?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {post.adminFeedbackImages.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noreferrer">
                        <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <textarea ref={feedbackRef} rows={3} placeholder="Write a public response to this suggestion... (visible to all users)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              defaultValue={post.adminFeedback}
            />

            <div className="mt-2">
              <label className={`inline-flex items-center gap-2 border-2 border-dashed rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                uploadingImages ? "border-primary bg-primary/5 cursor-wait" : feedbackImages.length >= 5 ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50" : "border-gray-200 hover:border-primary"
              }`}>
                <span>{uploadingImages ? "⏳" : "📷"}</span>
                <span className="text-gray-400 text-xs">
                  {uploadingImages ? "Uploading..." : feedbackImages.length >= 5 ? "Max 5 images" : "Add images"}
                </span>
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={handleFeedbackImageUpload} disabled={uploadingImages || feedbackImages.length >= 5} />
              </label>
            </div>

            {feedbackImages.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {feedbackImages.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                    <button type="button" onClick={() => setFeedbackImages(feedbackImages.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handlePublishFeedback}
              className="mt-3 bg-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-light font-medium">
              Publish Response
            </button>
          </div>

          {/* Internal note */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔒</span>
              <h2 className="font-semibold text-gray-700">Internal Note</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Admin only</span>
            </div>
            <textarea rows={3} placeholder="Add an internal note..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              defaultValue={post.adminNote} onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={() => submitNote()}
              className="mt-2 bg-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-light">
              Save Note
            </button>
          </div>

          {logs.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-700 mb-3">Escalation History</h2>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log._id} className="text-sm border-l-2 border-red-400 pl-3">
                    <p className="font-medium text-red-600">{log.reason}</p>
                    <p className="text-gray-400 text-xs">{timeAgo(log.triggeredAt)} · To: {log.escalatedTo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
