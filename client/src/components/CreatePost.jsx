import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

export default function CreatePost({ onPost }) {
  const { user } = useAuth();
  const MotionDiv = motion.div;
  const MotionImg = motion.img;
  const MotionButton = motion.button;
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onPost(content.trim(), imageFile || null);
      setContent("");
      setImageFile(null);
      setImagePreview("");
      setShowImageInput(false);
    } catch (err) {
      setError(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setShowImageInput(false);
  };

  return (
    <div className="glass-card p-4">
      <div className="flex gap-3">
        <img
          src={user?.avatar}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover border border-navy-200/20 flex-shrink-0 mt-0.5"
        />
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
            rows={content.length > 80 ? 4 : 2}
            className="input-field resize-none text-sm leading-relaxed"
          />

          <AnimatePresence>
            {showImageInput && (
              <MotionDiv
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2"
              >
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-field text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-electric-400/10 file:text-electric-400 hover:file:bg-electric-400/20"
                  />
                  <button
                    onClick={clearImage}
                    className="p-2.5 text-navy-200 hover:text-navy-50 hover:bg-navy-900/40 rounded-xl transition-colors flex-shrink-0"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                {imagePreview && (
                  <MotionImg
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={imagePreview}
                    alt="Preview"
                    className="mt-2 rounded-xl max-h-40 object-cover w-full"
                  />
                )}
              </MotionDiv>
            )}
          </AnimatePresence>

          {error && <p className="text-red-300 text-xs mt-1">{error}</p>}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowImageInput(!showImageInput)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                ${showImageInput ? "text-electric-400 bg-navy-900/40" : "text-navy-200 hover:text-navy-50 hover:bg-navy-900/40"}`}
            >
              <PhotoIcon className="w-4 h-4" />
              Photo
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${content.length > 250 ? "text-red-300" : "text-navy-200"}`}>
                {content.length}/280
              </span>
              <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={!content.trim() || loading || content.length > 280}
                className="btn-primary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-4 h-4" />
                )}
                Post
              </MotionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}