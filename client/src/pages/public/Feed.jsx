import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../../hooks/usePosts";
import { useAuth } from "../../hooks/useAuth";
import PostCard from "../../components/PostCard";
import FeedTabs from "../../components/FeedTabs";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import Navbar from "../../components/Navbar";
import PostSkeleton from "../../components/PostSkeleton";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function StatsSidebar({ posts }) {
  const total = posts.length;
  const resolved = posts.filter(p => p.status === "resolved").length;
  const inProgress = posts.filter(p => p.status === "in-progress").length;
  const pending = posts.filter(p => p.status === "pending").length;
  const totalVotes = posts.reduce((sum, p) => sum + (p.voteCount || 0), 0);

  const categories = posts.reduce((acc, p) => {
    const name = p.category?.name || "Uncategorized";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Posts", value: total, color: "bg-primary/10 text-primary" },
            { label: "Total Votes", value: totalVotes, color: "bg-accent/10 text-accent" },
            { label: "Resolved", value: resolved, color: "bg-green-100 text-green-700" },
            { label: "In Progress", value: inProgress, color: "bg-blue-100 text-blue-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-3 text-center`}>
              <p className="text-2xl font-extrabold">{value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Status</h3>
        <div className="space-y-2">
          {[
            { label: "Pending", count: pending, pct: total ? Math.round(pending/total*100) : 0, color: "bg-yellow-400" },
            { label: "In Progress", count: inProgress, pct: total ? Math.round(inProgress/total*100) : 0, color: "bg-blue-400" },
            { label: "Resolved", count: resolved, pct: total ? Math.round(resolved/total*100) : 0, color: "bg-green-400" },
          ].map(({ label, count, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{label}</span>
                <span className="font-semibold">{count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top categories */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Top Categories</h3>
          <div className="space-y-2">
            {topCategories.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 truncate flex-1">{name}</span>
                <span className="text-xs font-bold text-primary ml-2 bg-primary/10 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick action */}
      <Link to="/submit"
        className="block w-full bg-primary text-white text-center py-3 rounded-2xl font-bold text-sm hover:bg-primary-light transition-colors shadow-sm shadow-primary/30">
        + Share a Suggestion
      </Link>
    </div>
  );
}

export default function Feed() {
  const [feed, setFeed] = useState("latest");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { user } = useAuth();

  const { data: posts = [], isLoading, isError } = usePosts({ feed, search, category });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-6 px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Desktop: 2-col | Mobile: 1-col */}
          <div className="flex gap-6">
            {/* Main feed */}
            <div className="flex-1 min-w-0 space-y-4">
              <FeedTabs active={feed} onChange={setFeed} />
              <SearchBar onSearch={setSearch} />
              <CategoryFilter active={category} onChange={setCategory} />

              {isLoading && (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <PostSkeleton key={i} />)}
                </div>
              )}
              {isError && <p className="text-center text-red-400 py-10">Failed to load posts.</p>}
              {!isLoading && posts.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-gray-400 font-medium">No posts yet.</p>
                  <p className="text-gray-300 text-sm mt-1">Be the first to share a suggestion!</p>
                </div>
              )}
              <div className="space-y-3">
                {posts.map((post) => <PostCard key={post._id} post={post} />)}
              </div>
            </div>

            {/* Stats sidebar — desktop only */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-6">
                {user && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.faculty || user.role}</p>
                      </div>
                    </div>
                  </div>
                )}
                <StatsSidebar posts={posts} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating + button for mobile */}
      <Link to="/submit"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-light transition-colors active:scale-95 z-50 print:hidden lg:hidden">
        +
      </Link>
    </>
  );
}
