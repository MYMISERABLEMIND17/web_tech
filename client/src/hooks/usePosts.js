import { useState, useEffect, useCallback } from "react";
import { postsAPI } from "../services/api";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await postsAPI.getAll(pageNum);
      if (data.length < 10) setHasMore(false);
      
      setPosts(prev => pageNum === 1 ? data : [...prev, ...data]);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
    }
  }, [loading, hasMore, page, fetchPosts]);

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

  return { posts, loading, error, addPost, toggleLike, addComment, loadMore, hasMore };
}