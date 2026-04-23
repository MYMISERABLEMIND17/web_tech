import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../context/AuthContext";
import { timeAgo } from "../utils/timeAgo";

export default function PostCard({ post, onLike, onComment }) {
  const { user } = useAuth();
  const MotionDiv = motion.div;
  const MotionImg = motion.img;
  const MotionButton = motion.button;
  const MotionSpan = motion.span;
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  const isLiked = post.likes.includes(user?._id);
  const likeCount = post.likes.length;
  const commentCount = useMemo(
    () => (Array.isArray(post.comments) ? post.comments.length : Number(post.comments || 0)),
    [post.comments]
  );

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const submitComment = async () => {
    if (!onComment) return;
    setCommentLoading(true);
    setCommentError("");
    try {
      await onComment(post._id, commentText);
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      setCommentError(err.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <Link to={`/profile/${post.author._id}`}>
          <MotionImg
            whileHover={{ scale: 1.05 }}
            src={post.author.avatar}
            alt={post.author.name}
            className="w-11 h-11 rounded-full object-cover border border-navy-200/20 flex-shrink-0"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${post.author._id}`}
            className="font-semibold text-navy-50 hover:text-electric-400 transition-colors leading-tight block"
          >
            {post.author.name}
          </Link>
          <p className="text-xs text-navy-200 truncate">
            {post.author.college}
          </p>
          <p className="text-xs text-navy-200/80">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-navy-100 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="mx-4 mb-3 rounded-xl overflow-hidden">
          <MotionImg
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            src={post.image}
            alt="Post"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-2 flex items-center justify-between text-xs text-navy-400">
        <span>{likeCount > 0 ? `${likeCount} like${likeCount !== 1 ? "s" : ""}` : ""}</span>
        <span>{commentCount > 0 ? `${commentCount} comment${commentCount !== 1 ? "s" : ""}` : ""}</span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-navy-200/10" />

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-between">
        <MotionButton
          whileTap={{ scale: 0.88 }}
          onClick={() => onLike(post._id, user?._id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${isLiked ? "text-red-300 bg-red-950/25" : "text-navy-200 hover:bg-navy-900/40 hover:text-navy-50"}`}
        >
          <AnimatePresence mode="wait">
            {isLiked ? (
              <MotionSpan
                key="liked"
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <HeartSolid className="w-5 h-5" />
              </MotionSpan>
            ) : (
              <MotionSpan key="unlike" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                <HeartIcon className="w-5 h-5" />
              </MotionSpan>
            )}
          </AnimatePresence>
          Like
        </MotionButton>

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-navy-200 hover:bg-navy-900/40 hover:text-navy-50 transition-all duration-200"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          Comment
        </button>

        <MotionButton
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${shared ? "text-electric-400 bg-navy-900/40" : "text-navy-200 hover:bg-navy-900/40 hover:text-navy-50"}`}
        >
          <ShareIcon className="w-5 h-5" />
          {shared ? "Copied!" : "Share"}
        </MotionButton>

        <MotionButton
          whileTap={{ scale: 0.9 }}
          onClick={() => setSaved(!saved)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
            ${saved ? "text-electric-500 bg-navy-900/40" : "text-navy-200 hover:bg-navy-900/40 hover:text-navy-50"}`}
        >
          <BookmarkIcon className="w-5 h-5" />
        </MotionButton>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <MotionDiv
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-navy-200/10 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitComment();
                  }}
                  placeholder="Write a comment…"
                  className="input-field text-sm"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={!commentText.trim() || commentLoading || !onComment}
                  className="btn-primary px-4 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {commentLoading ? "..." : "Post"}
                </button>
              </div>
              {commentError && <p className="text-xs text-red-300">{commentError}</p>}

              <div className="space-y-2">
                {Array.isArray(post.comments) && post.comments.length > 0 ? (
                  post.comments.map((c) => (
                    <div key={c._id || `${c.createdAt}-${c.text}`} className="flex gap-2">
                      <img
                        src={c.user?.avatar || "https://api.dicebear.com/9.x/notionists/svg?seed=User&backgroundColor=b6e3f4"}
                        alt={c.user?.name || "User"}
                        className="w-7 h-7 rounded-full object-cover border border-navy-200/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-navy-50 font-semibold leading-none">
                          {c.user?.name || "User"}
                        </p>
                        <p className="text-sm text-navy-100 whitespace-pre-wrap break-words">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-navy-200">No comments yet.</p>
                )}
              </div>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
}