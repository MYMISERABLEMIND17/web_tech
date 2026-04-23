import { useState, useEffect, useCallback } from "react";
import { postsAPI } from "../services/api";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await postsAPI.getAll();
        setPosts(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const addPost = useCallback(async (content, image) => {
    try {
      let payload;
      if (image instanceof File) {
        payload = new FormData();
        payload.append("content", content);
        payload.append("image", image);
      } else {
        payload = { content, image: image || null };
      }
      const { data } = await postsAPI.create(payload);
      setPosts((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create post");
    }
  }, []);

  const toggleLike = useCallback(async (postId, userId) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(userId);
        return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
      })
    );
    try {
      await postsAPI.like(postId);
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const liked = p.likes.includes(userId);
          return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
        })
      );
    }
  }, []);

  const addComment = useCallback(async (postId, text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) throw new Error("Comment cannot be empty");
    try {
      const { data } = await postsAPI.comment(postId, { text: trimmed });
      setPosts((prev) => prev.map((p) => (p._id === postId ? data : p)));
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to add comment");
    }
  }, []);

  return { posts, loading, error, addPost, toggleLike, addComment };
}