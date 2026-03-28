import { useState } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../../hooks/usePosts";
import PostCard from "../../components/PostCard";
import FeedTabs from "../../components/FeedTabs";
import SearchBar from "../../components/SearchBar";
import CategoryFilter from "../../components/CategoryFilter";
import Navbar from "../../components/Navbar";
import PostSkeleton from "../../components/PostSkeleton";

export default function Feed() {
  const [feed, setFeed] = useState("latest");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data: posts = [], isLoading, isError } = usePosts({ feed, search, category });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-5">
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
            <p className="text-center text-gray-400 py-10">No posts yet. Be the first!</p>
          )}
          <div className="space-y-3">
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
        </div>
      </div>

      {/* Floating + button for mobile */}
      <Link to="/submit"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-primary-light transition-colors active:scale-95 z-50 print:hidden">
        +
      </Link>
    </>
  );
}