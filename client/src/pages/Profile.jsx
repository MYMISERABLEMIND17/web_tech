import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { usePosts } from "../hooks/usePosts";
import { usersAPI } from "../services/api";
import { PencilSquareIcon, MapPinIcon, AcademicCapIcon, LinkIcon } from "@heroicons/react/24/outline";

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { toggleLike, addComment } = usePosts();
  const isOwner = userId === currentUser?._id;
  const MotionDiv = motion.div;
  const MotionImg = motion.img;

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          usersAPI.getProfile(userId),
          usersAPI.getUserPosts(userId),
        ]);
        setProfile(profileRes.data);
        setUserPosts(postsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="glass-card overflow-hidden mb-5 animate-pulse">
          <div className="h-32 bg-navy-900/40" />
          <div className="p-5 space-y-3">
            <div className="w-20 h-20 rounded-full bg-navy-900/40 -mt-10" />
            <div className="h-4 bg-navy-900/40 rounded w-1/3" />
            <div className="h-3 bg-navy-900/30 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="glass-card p-8 text-center text-navy-200">User not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden mb-5">
        <div className="h-32 bg-gradient-to-br from-electric-400/25 via-navy-900/30 to-transparent relative">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 20% 60%, #4facfe 0%, transparent 50%), radial-gradient(circle at 80% 30%, #1e3d84 0%, transparent 50%)" }}
          />
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-3">
            <MotionImg
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 rounded-full border border-navy-200/20 shadow-md object-cover"
            />
            {isOwner && (
              <button className="btn-secondary flex items-center gap-1.5 text-sm">
                <PencilSquareIcon className="w-4 h-4" />
                Edit profile
              </button>
            )}
          </div>

          <h1 className="text-xl font-bold text-navy-50">{profile.name}</h1>
          {profile.bio && <p className="text-navy-200 text-sm mt-0.5">{profile.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-navy-200">
            {profile.college && (
              <span className="flex items-center gap-1">
                <AcademicCapIcon className="w-3.5 h-3.5" />
                {profile.college}
              </span>
            )}
            {profile.branch && (
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5" />
                {profile.branch} {profile.year && `• ${profile.year}`}
              </span>
            )}
            {profile.username && (
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" />
                @{profile.username}
              </span>
            )}
          </div>

          <div className="flex gap-5 mt-4 pt-4 border-t border-navy-200/10">
            {[
              ["Connections", profile.connections || 0],
              ["Followers", profile.followers?.length || 0],
              ["Following", profile.following?.length || 0],
              ["Posts", userPosts.length],
            ].map(([label, val]) => (
              <div key={label} className="text-center">
                <p className="text-base font-bold text-navy-50">{val}</p>
                <p className="text-xs text-navy-200">{label}</p>
              </div>
            ))}
          </div>

          {profile.skills?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-navy-200 uppercase tracking-wider mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-navy-900/35 text-navy-100 border border-navy-200/10 rounded-full px-3 py-1 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </MotionDiv>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-navy-200 uppercase tracking-wider px-1">Posts</h2>
        {userPosts.length === 0 ? (
          <div className="glass-card p-8 text-center text-navy-200">No posts yet.</div>
        ) : (
          userPosts.map((post, i) => (
            <MotionDiv key={post._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <PostCard post={post} onLike={toggleLike} onComment={addComment} />
            </MotionDiv>
          ))
        )}
      </div>
    </div>
  );
}