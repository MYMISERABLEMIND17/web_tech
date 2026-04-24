import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../hooks/usePosts";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import CampusHighlights from "../components/CampusHighlights";
import { Link } from "react-router-dom";
import { AcademicCapIcon, SparklesIcon } from "@heroicons/react/24/outline";

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Feed() {
  const { user } = useAuth();
  const { posts, loading, error, addPost, toggleLike, addComment, loadMore, hasMore } = usePosts();
  const MotionDiv = motion.div;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col gap-3 w-64 flex-shrink-0">
        <MotionDiv initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
          <div className="h-16 bg-gradient-to-br from-navy-900/30 via-navy-900/10 to-transparent" />
          <div className="px-4 pb-4 -mt-8">
            <Link to={`/profile/${user?._id}`}>
              <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-full border border-navy-200/20 object-cover shadow-sm" />
            </Link>
            <div className="mt-2">
              <Link to={`/profile/${user?._id}`} className="font-semibold text-navy-50 hover:text-electric-400 transition-colors">
                {user?.name}
              </Link>
              <p className="text-xs text-navy-200">{user?.college}</p>
              <p className="text-xs text-navy-200">{user?.branch}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-navy-200/10 flex justify-between text-center">
              <div>
                <p className="text-sm font-bold text-navy-50">{user?.connections?.length || 0}</p>
                <p className="text-xs text-navy-200">Connections</p>
              </div>
              <div>
                <p className="text-sm font-bold text-navy-50">{posts.filter(p => p.author._id === user?._id).length}</p>
                <p className="text-xs text-navy-200">Posts</p>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4">
          <h3 className="text-xs font-semibold text-navy-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <SparklesIcon className="w-3.5 h-3.5" />
            Trending Tags
          </h3>
          {["#GSoC2026", "#OpenSource", "#MERN", "#DSA", "#Internship", "#Hackathon"].map((tag) => (
            <button key={tag} className="block w-full text-left text-sm text-navy-100 hover:text-navy-50 hover:bg-navy-900/40 px-2 py-1.5 rounded-lg transition-colors">
              {tag}
            </button>
          ))}
        </MotionDiv>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 min-w-0 space-y-4">
        <CampusHighlights />
        <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <CreatePost onPost={addPost} />
        </MotionDiv>

        {error && (
          <div className="glass-card p-4 text-center text-red-300 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-11 h-11 bg-navy-900/40 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-navy-900/40 rounded-full w-1/3" />
                    <div className="h-2.5 bg-navy-900/30 rounded-full w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-navy-900/30 rounded-full" />
                  <div className="h-3 bg-navy-900/30 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <AcademicCapIcon className="w-10 h-10 text-navy-200 mx-auto mb-3" />
            <p className="text-navy-50 font-medium">No posts yet</p>
            <p className="text-navy-200 text-sm mt-1">Be the first to share something!</p>
          </div>
        ) : (
          <MotionDiv variants={stagger} initial="initial" animate="animate" className="space-y-4">
            {posts.map((post) => (
              <MotionDiv key={post._id} variants={fadeUp}>
                <PostCard post={post} onLike={toggleLike} onComment={addComment} />
              </MotionDiv>
            ))}

            {hasMore && posts.length > 0 && (
              <div className="pt-4 pb-2 text-center">
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  className="px-6 py-2 rounded-full text-sm font-medium bg-navy-900/40 text-electric-400 hover:bg-navy-900/60 border border-electric-400/20 transition-colors disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load More Posts"}
                </button>
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-navy-200 pt-4 pb-2">
                You've caught up on all posts!
              </p>
            )}
          </MotionDiv>
        )}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:flex flex-col gap-3 w-60 flex-shrink-0">
        <MotionDiv initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4">
          <h3 className="text-xs font-semibold text-navy-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <AcademicCapIcon className="w-3.5 h-3.5" />
            Campus Network
          </h3>
          <p className="text-xs text-navy-200 mb-3">Connect with peers to grow your network!</p>
          <Link to="/network" className="w-full block text-center py-2 bg-navy-900/40 hover:bg-navy-900/60 text-electric-400 rounded-lg text-sm transition-colors border border-electric-400/20">
            View All Users
          </Link>
        </MotionDiv>
      </aside>
    </div>
  );
}