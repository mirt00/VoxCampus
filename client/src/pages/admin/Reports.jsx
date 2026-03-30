import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAdminPosts } from "../../api/admin.api";
import AdminNavbar from "../../components/AdminNavbar";

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminPosts", { limit: 1000 }],
    queryFn: () => getAdminPosts({ limit: 1000 }).then(r => r.data),
  });

  const posts = data?.posts || [];
  const total = posts.length;
  const totalVotes = posts.reduce((s, p) => s + (p.voteCount || 0), 0);
  const resolved = posts.filter(p => p.status === "resolved").length;
  const inProgress = posts.filter(p => p.status === "in-progress").length;
  const pending = posts.filter(p => p.status === "pending").length;
  const rejected = posts.filter(p => p.status === "rejected").length;
  const escalated = posts.filter(p => p.isEscalated).length;

  const categories = posts.reduce((acc, p) => {
    const name = p.category?.name || "Uncategorized";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  const topPosts = [...posts].sort((a, b) => b.voteCount - a.voteCount).slice(0, 5);

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  if (isLoading) return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading report...</p>
      </div>
    </>
  );

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-primary">Analytics Report</h1>
              <p className="text-gray-400 text-sm mt-0.5">Overview of all campus suggestions</p>
            </div>
            <Link to="/admin/dashboard" className="text-sm text-gray-500 hover:text-primary transition-colors">
              ← Dashboard
            </Link>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Posts", value: total, color: "bg-primary/10 text-primary", icon: "📋" },
              { label: "Total Votes", value: totalVotes, color: "bg-accent/10 text-accent", icon: "▲" },
              { label: "Resolved", value: resolved, color: "bg-green-100 text-green-700", icon: "✅" },
              { label: "Escalated", value: escalated, color: "bg-red-100 text-red-600", icon: "🔴" },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className={`${color} rounded-2xl p-5 text-center`}>
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-3xl font-extrabold">{value}</p>
                <p className="text-xs font-semibold mt-1 opacity-80">{label}</p>
              </div>
            ))}
          </div>

          {/* Resolution rate */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Resolution Rate</h2>
              <span className="text-2xl font-extrabold text-green-600">{resolutionRate}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all duration-700"
                style={{ width: `${resolutionRate}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">{resolved} resolved out of {total} total posts</p>
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5">Status Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "Pending", count: pending, color: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50" },
                { label: "In Progress", count: inProgress, color: "bg-blue-400", text: "text-blue-700", bg: "bg-blue-50" },
                { label: "Resolved", count: resolved, color: "bg-green-400", text: "text-green-700", bg: "bg-green-50" },
                { label: "Rejected", count: rejected, color: "bg-red-400", text: "text-red-600", bg: "bg-red-50" },
              ].map(({ label, count, color, text, bg }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700">{count}</span>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top categories */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Posts by Category</h2>
              <div className="space-y-3">
                {topCategories.map(([name, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="truncate flex-1">{name}</span>
                        <span className="font-bold ml-2">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top voted posts */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">Most Voted Posts</h2>
              <div className="space-y-3">
                {topPosts.map((post, i) => (
                  <Link key={post._id} to={`/admin/post/${post._id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-600" :
                      i === 2 ? "bg-orange-100 text-orange-600" : "bg-gray-50 text-gray-400"
                    }`}>{i + 1}</span>
                    <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </span>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      ▲ {post.voteCount}
                    </span>
                  </Link>
                ))}
                {topPosts.length === 0 && <p className="text-gray-400 text-sm">No posts yet.</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
