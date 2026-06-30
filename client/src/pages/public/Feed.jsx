import { Link, useSearchParams } from "react-router-dom";
import { usePosts } from "../../hooks/usePosts";
import PostCard from "../../components/PostCard";
import FeedTabs from "../../components/FeedTabs";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import Navbar from "../../components/Navbar";
import PostSkeleton from "../../components/PostSkeleton";
import { useAuth } from "../../hooks/useAuth";

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const feed = searchParams.get("feed") || "latest";
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const { data: posts = [], isLoading, isError } = usePosts({ feed, search, category });

  const setParam = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="lg:grid lg:grid-cols-[1fr_288px] lg:gap-8">

            {/* ── Main feed column ─────────────────────── */}
            <div className="space-y-4 min-w-0">
              <FeedTabs active={feed} onChange={(val) => setParam("feed", val)} />
              <SearchBar onSearch={(val) => setParam("search", val)} defaultValue={search} />

              {/* Category filter — mobile only (shown in sidebar on desktop) */}
              <div className="lg:hidden">
                <CategoryFilter active={category} onChange={(val) => setParam("category", val)} />
              </div>

              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
                </div>
              )}
              {isError && (
                <div className="text-center py-10 bg-white rounded-2xl border border-red-100">
                  <p className="text-red-400 font-medium">Failed to load posts.</p>
                </div>
              )}
              {!isLoading && posts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 font-semibold text-lg">No posts yet.</p>
                  <p className="text-gray-400 text-sm mt-1 mb-5">Be the first to share a suggestion!</p>
                  <Link to="/submit"
                    className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-light transition-colors">
                    + Post a Suggestion
                  </Link>
                </div>
              )}

              <div className="space-y-4">
                {posts.map(post => <PostCard key={post._id} post={post} />)}
              </div>
            </div>

            {/* ── Sidebar — desktop only ────────────────── */}
            <aside className="hidden lg:block space-y-5">

              {/* CTA card */}
              <div className="bg-primary rounded-2xl p-5 text-white">
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-base mb-1">Share your voice</h3>
                <p className="text-blue-200 text-xs leading-relaxed mb-4">
                  Got a campus issue or idea? Submit it — anonymously or with your name.
                </p>
                <Link to="/submit"
                  className="block text-center bg-accent text-white py-2 rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors">
                  + Post a Suggestion
                </Link>
              </div>

              {/* Category filter */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Browse by Category</h3>
                <CategoryFilter active={category} onChange={(val) => setParam("category", val)} />
              </div>

              {/* How it works */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">How it works</h3>
                <ul className="space-y-2.5 text-xs text-gray-500">
                  {[
                    ["📝", "Submit a suggestion or complaint"],
                    ["👍", "Community votes on important issues"],
                    ["🔔", "Admin reviews and updates status"],
                    ["✅", "You get notified when it's resolved"],
                  ].map(([icon, text]) => (
                    <li key={text} className="flex items-start gap-2.5">
                      <span className="text-sm">{icon}</span>
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Anonymous tip */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700">
                🔒 <strong>Anonymous posting</strong> is supported. Your name is never revealed unless you choose to.
              </div>

            </aside>
          </div>
        </div>
      </div>

      {/* Floating + button */}
      <Link to="/submit"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-light transition-colors active:scale-95 z-50 print:hidden">
        +
      </Link>
    </>
  );
}
