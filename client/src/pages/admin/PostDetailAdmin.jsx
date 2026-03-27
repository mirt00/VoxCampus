import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEscalationLog, saveAdminNote } from "../../api/admin.api";
import { getPostById } from "../../api/posts.api";
import AdminNavbar from "../../components/AdminNavbar";
import StatusBadge from "../../components/StatusBadge";
import { timeAgo } from "../../utils/timeAgo";
import toast from "react-hot-toast";

export default function PostDetailAdmin() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: post } = useQuery({ queryKey: ["post", id], queryFn: () => getPostById(id).then((r) => r.data) });
  const { data: logs = [] } = useQuery({ queryKey: ["escalationLog", id], queryFn: () => getEscalationLog(id).then((r) => r.data) });

  const { mutate: submitNote } = useMutation({
    mutationFn: () => saveAdminNote(id, note),
    onSuccess: () => { toast.success("Note saved"); qc.invalidateQueries({ queryKey: ["post", id] }); },
  });

  if (!post) return <><AdminNavbar /><p className="text-center py-20 text-gray-400">Loading...</p></>;

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category?.name}</span>
              <StatusBadge status={post.status} />
              {post.isEscalated && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">Escalated</span>}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <p className="text-gray-600 whitespace-pre-wrap">{post.body}</p>
            <p className="text-xs text-gray-400 mt-3">
              {post.author?.type === "anonymous" ? "Anonymous" : post.author?.displayName} · {timeAgo(post.createdAt)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Admin Note</h2>
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
