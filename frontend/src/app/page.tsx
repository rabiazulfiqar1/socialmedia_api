"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Post {
  id: number;
  body: string;
  user_id: number;
  image_url: string | null;
  likes: number;
}

interface Comment {
  id: number;
  body: string;
  post_id: number;
  user_id: number;
}

export default function Home() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [sorting, setSorting] = useState("new");
  const [newPost, setNewPost] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");

  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  const [globalError, setGlobalError] = useState("");

  const fetchPosts = useCallback(async (sort: string) => {
    setFeedLoading(true);
    setFeedError("");
    try {
      const res = await fetch(`${API}/post?sorting=${sort}`);
      if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
      const data = await res.json();
      setPosts(data);
    } catch (err: unknown) {
      setFeedError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchPosts(sorting);
  }, [token, sorting, fetchPosts]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMsg("");
    setAuthLoading(true);

    try {
      if (isRegister) {
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");
        setAuthMsg(data.detail || "Registration successful");
        setConfirmUrl(data.confirmation_url || "");
      } else {
        const res = await fetch(`${API}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ username: authEmail, password: authPass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        setToken(data.access_token);
        setEmail(authEmail);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setEmail("");
    setPosts([]);
    setExpandedPost(null);
    setComments({});
    setAuthMsg("");
    setAuthError("");
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPostLoading(true);
    setGlobalError("");

    try {
      const res = await fetch(`${API}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: newPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create post");
      setNewPost("");
      fetchPosts(sorting);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleLike = async (postId: number) => {
    setGlobalError("");
    try {
      const res = await fetch(`${API}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to like post");
      fetchPosts(sorting);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to like post");
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`${API}/post/${postId}/comment`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments((prev) => ({ ...prev, [postId]: data }));
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to load comments");
    }
  };

  const toggleExpand = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) fetchComments(postId);
    }
  };

  const handleComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    setGlobalError("");

    try {
      const res = await fetch(`${API}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: text, post_id: postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add comment");
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ===== PORTFOLIO BANNER ===== */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 h-64 w-64 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10 text-center">
          <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">RZ Social</span>
          </h1>
          <p className="animate-slide-up-delay mt-3 text-base text-muted sm:text-lg">
            A full-stack social media platform built by{" "}
            <span className="text-primary-light font-semibold">Rabia Zulfiqar</span>
          </p>
          <div className="animate-slide-up-delay-2 mt-4 flex flex-wrap items-center justify-center gap-2">
            {["FastAPI", "React", "Next.js", "SQLAlchemy", "JWT Auth", "Tailwind CSS"].map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light"
              >
                {badge}
              </span>
            ))}
          </div>
          <a
            href="https://github.com/rabiazulfiqar"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-primary-light transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* ===== GLOBAL ERROR ===== */}
        {globalError && (
          <div className="alert-error flex items-center justify-between">
            <span>{globalError}</span>
            <button onClick={() => setGlobalError("")} className="ml-4 text-lg font-bold hover:text-white">
              ×
            </button>
          </div>
        )}

        {/* ===== AUTH SECTION ===== */}
        {!token ? (
          <section className="glass-card p-6 animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthError("");
                  setAuthMsg("");
                  setConfirmUrl("");
                }}
                className="text-sm text-primary-light hover:text-accent transition-colors"
              >
                {isRegister ? "Already have an account? Login" : "Need an account? Register"}
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-muted">Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field focus:input-field-focus"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-muted">Password</label>
                <input
                  type="password"
                  value={authPass}
                  onChange={(e) => setAuthPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field focus:input-field-focus"
                />
              </div>

              {authError && <div className="alert-error">{authError}</div>}
              {authMsg && (
                <div className="alert-success">
                  <p>{authMsg}</p>
                  {confirmUrl && (
                    <a
                      href={confirmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm underline hover:text-white transition-colors"
                    >
                      Click here to confirm your email
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full gradient-btn hover:gradient-btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* ===== LOGGED IN HEADER ===== */}
            <section className="glass-card p-4 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                  {email[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{email}</p>
                  <p className="text-xs text-muted">Logged in</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                Logout
              </button>
            </section>

            {/* ===== CREATE POST ===== */}
            <section className="glass-card p-6 animate-slide-up">
              <h3 className="mb-3 text-lg font-semibold">Create Post</h3>
              <form onSubmit={handleCreatePost} className="space-y-3">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="input-field focus:input-field-focus resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={postLoading || !newPost.trim()}
                    className="gradient-btn hover:gradient-btn-hover disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {postLoading ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </section>

            {/* ===== FEED CONTROLS ===== */}
            <section className="flex items-center justify-between animate-slide-up-delay">
              <div className="flex gap-2">
                {(["new", "old", "most_likes"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSorting(s)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      sorting === s
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                        : "bg-surface-light/50 text-muted hover:text-foreground hover:bg-surface-light"
                    }`}
                  >
                    {s === "most_likes" ? "Most Liked" : s === "new" ? "New" : "Old"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchPosts(sorting)}
                disabled={feedLoading}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary-light transition-all disabled:opacity-50"
              >
                {feedLoading ? "Loading..." : "↻ Refresh"}
              </button>
            </section>

            {/* ===== FEED ERROR ===== */}
            {feedError && <div className="alert-error">{feedError}</div>}

            {/* ===== POSTS FEED ===== */}
            <section className="space-y-4 animate-slide-up-delay-2">
              {feedLoading && posts.length === 0 && (
                <div className="glass-card p-12 text-center text-muted">Loading posts...</div>
              )}

              {!feedLoading && posts.length === 0 && (
                <div className="glass-card p-12 text-center text-muted">
                  No posts yet. Be the first to post!
                </div>
              )}

              {posts.map((post) => (
                <article key={post.id} className="glass-card p-5 hover:glass-card-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/20 text-xs font-bold text-secondary">
                          U{post.user_id}
                        </div>
                        <span className="text-xs text-muted">User {post.user_id}</span>
                        <span className="text-xs text-muted">·</span>
                        <span className="text-xs text-muted">#{post.id}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post attachment"
                          className="mt-3 max-h-64 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likes}</span>
                    </button>
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Comments
                    </button>
                  </div>

                  {/* ===== EXPANDED COMMENTS ===== */}
                  {expandedPost === post.id && (
                    <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                      {comments[post.id]?.length === 0 && (
                        <p className="text-xs text-muted text-center">No comments yet</p>
                      )}

                      {comments[post.id]?.map((c) => (
                        <div key={c.id} className="flex gap-3 rounded-lg bg-surface/50 p-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                            U{c.user_id}
                          </div>
                          <p className="text-sm text-muted">{c.body}</p>
                        </div>
                      ))}

                      <form
                        onSubmit={(e) => handleComment(e, post.id)}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={commentTexts[post.id] || ""}
                          onChange={(e) =>
                            setCommentTexts((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a comment..."
                          className="input-field focus:input-field-focus flex-1"
                        />
                        <button
                          type="submit"
                          disabled={commentLoading[post.id] || !commentTexts[post.id]?.trim()}
                          className="gradient-btn hover:gradient-btn-hover text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {commentLoading[post.id] ? "..." : "Reply"}
                        </button>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </section>
          </>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-6 px-6 mt-12">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Rabia Zulfiqar — CS 3rd Year
          </p>
          <p className="text-sm text-muted">
            Built with <span className="text-primary-light">Next.js</span> &amp;{" "}
            <span className="text-accent">FastAPI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
