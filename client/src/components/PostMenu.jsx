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

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = async () => {
    try {
      await deletePost(postId);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      toast.success("Post deleted");
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Vertical three dot button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className={`w-8 h-8 flex flex-col items-center justify-center gap-[3px] rounded-full transition-all duration-200 ${
          open ? "bg-primary text-white shadow-md" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
        }`}
      >
        <span className={`w-1 h-1 rounded-full transition-colors ${open ? "bg-white" : "bg-gray-500"}`} />
        <span className={`w-1 h-1 rounded-full transition-colors ${open ? "bg-white" : "bg-gray-500"}`} />
        <span className={`w-1 h-1 rounded-full transition-colors ${open ? "bg-white" : "bg-gray-500"}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 w-44 overflow-hidden
                        animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onEdit?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 
                         hover:bg-primary/5 hover:text-primary rounded-xl transition-colors duration-150"
            >
              <span className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-base">✏️</span>
              Edit Post
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                setShowConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 
                         hover:bg-red-50 rounded-xl transition-colors duration-150"
            >
              <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-base">🗑️</span>
              Delete Post
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🗑️
            </div>
            <h3 className="font-bold text-gray-800 text-center text-lg mb-1">Delete Post?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
