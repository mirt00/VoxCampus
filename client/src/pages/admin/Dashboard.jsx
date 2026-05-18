import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, ArrowUp, CheckCircle, AlertTriangle, Link as LinkIcon } from "lucide-react";
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

  const { data: allData } = useQuery({
    queryKey: ["adminPosts", { limit: 1000 }],
    queryFn: () => getAdminPosts({ limit: 1000 }).then(r => r.data),
    staleTime: 30000,
  });

  const allPosts = allData?.posts || [];
  const total = allPosts.length;
  const totalVotes = allPosts.reduce((s, p) => s + (p.voteCount || 0), 0);
  const resolved = allPosts.filter(p => p.status === "resolved").length;
  const escalated = allPosts.filter(p => p.isEscalated).length;

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, status }) => updatePostStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminPosts"] }),
    onError: () => toast.error("Failed to update status"),
  });

  const KPI_CARDS = [
    { label: "Total Posts", value: total, color: "bg-primary/10 text-primary", icon: FileText },
    { label: "Total Votes", value: totalVotes, color: "bg-accent/10 text-accent", icon: ArrowUp },
    { label: "Resolved", value: resolved, color: "bg-green-100 text-green-700", icon: CheckCircle },
    { label: "Escalated", value: escalated, color: "bg-red-100 text-red-600", icon: AlertTriangle },
  ];

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
              <p className="text-gray-400 text-xs mt-0.5">Overview of all campus suggestions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/reports" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
                <LinkIcon className="w-3 h-3" /> Full Reports
              </Link>
              <select className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* KPI summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {KPI_CARDS.map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`${color} rounded-2xl p-4 text-center`}>
                <div className="flex justify-center mb-1.5">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80">{label}</p>
              </div>
            ))}
          </div>

          {/* Mobile cards view */}
          <div className="block lg:hidden space-y-3">
            {isLoading ? (
              <p className="text-center text-gray-400 py-10">Loading...</p>
            ) : data?.posts?.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  {post.author?.type === "anonymous" ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
                  ) : post.author?.avatar ? (
                    <img src={post.author.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      {post.author?.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {post.author?.type === "anonymous" ? "Anonymous" : post.author?.displayName}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                  </div>
                  {post.isEscalated && post.status === "pending" && <span className="ml-auto w-2 h-2 rounded-full bg-red-500" title="Escalated" />}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{post.body}</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category?.name}</span>
                    <span className="text-xs font-semibold text-primary">▲ {post.voteCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={post.status}
                      onChange={(e) => changeStatus({ id: post._id, status: e.target.value })}
                      className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <Link to={`/admin/post/${post._id}`} className="text-primary text-xs hover:underline">View</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-left px-4 py-3">Author</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Votes</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : data?.posts?.map((post) => (
                  <tr key={post._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {post.author?.type === "anonymous" ? (
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
                        ) : post.author?.avatar ? (
                          <img src={post.author.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                            {post.author?.displayName?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="text-xs text-gray-600 max-w-[80px] truncate">
                          {post.author?.type === "anonymous" ? "Anonymous" : post.author?.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        {post.isEscalated && post.status === "pending" && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Escalated" />}
                        {post.flagged && <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" title="Flagged by moderation" />}
                        <span className="line-clamp-1">{post.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{post.category?.name}</td>
                    <td className="px-4 py-3 font-semibold">{post.voteCount}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{timeAgo(post.createdAt)}</td>
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

          {/* Pagination */}
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
