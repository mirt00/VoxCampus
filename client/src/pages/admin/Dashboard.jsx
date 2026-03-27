import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminPosts, updatePostStatus } from "../../api/admin.api";
import AdminNavbar from "../../components/AdminNavbar";
import StatusBadge from "../../components/StatusBadge";
import { timeAgo } from "../../utils/timeAgo";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const STATUSES = ["pending", "in-progress", "resolved", "rejected"];

export default function Dashboard() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ status: "", page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ["adminPosts", filters],
    queryFn: () => getAdminPosts(filters).then((r) => r.data),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }) => updatePostStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPosts"] }),
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Votes</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : data?.posts?.map((post) => (
                  <tr key={post._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        {post.isEscalated && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Escalated" />}
                        <span className="line-clamp-1">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{post.category?.name}</td>
                    <td className="px-4 py-3 font-semibold">{post.voteCount}</td>
                    <td className="px-4 py-3 text-gray-400">{timeAgo(post.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select value={post.status}
                        onChange={(e) => changeStatus({ id: post._id, status: e.target.value })}
                        className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/post/${post._id}`} className="text-primary text-xs hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.posts?.length === 0 && (
              <p className="text-center text-gray-400 py-8">No posts found.</p>
            )}
          </div>

          {data && data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters({ ...filters, page: p })}
                  className={`px-3 py-1 rounded text-sm ${filters.page === p ? "bg-primary text-white" : "border hover:border-primary"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
