import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost } from "../api/posts.api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function PostMenu({ postId, onEdit }) {
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async () => {
    try {
      await deletePost(postId);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      toast.success("Post deleted");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      >
        ···
      </button>

      {open && (
        <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[130px] overflow-hidden">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onEdit?.(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ✏️ Edit
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); setShowConfirm(true); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-1">Delete this post?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600">
                Delete
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
