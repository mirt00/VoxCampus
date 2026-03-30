import { Link, useSearchParams } from "react-router-dom";
import { usePosts } from "../../hooks/usePosts";
import PostCard from "../../components/PostCard";
import FeedTabs from "../../components/FeedTabs";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import Navbar from "../../components/Navbar";
import PostSkeleton from "../../components/PostSkeleton";

export default function Feed() {
  const [searchParams, setSearchParams] = useSearchParams();

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
      <div className="min-h-screen bg-gray-50 py-6 px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-4">
          <FeedTabs active={feed} onChange={(val) => setParam("feed", val)} />
          <SearchBar onSearch={(val) => setParam("search", val)} defaultValue={search} />
          <CategoryFilter active={category} onChange={(val) => setParam("category", val)} />

          {isLoading && (
            <div className="space-y-3">
              {[1,2,3].map(i => <PostSkeleton key={i} />)}
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
            {posts.map(post => <PostCard key={post._id} post={post} />)}
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
