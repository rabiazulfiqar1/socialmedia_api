"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Static portfolio data (displayed when backend has no posts)        */
/* ------------------------------------------------------------------ */

const PORTFOLIO_PROJECTS = [
  {
    title: "Social Media API & Platform",
    body: "🚀 A full-stack social media platform with user authentication (JWT + OAuth2), post creation, commenting, likes, file uploads to Backblaze B2, AI-generated images via DeepAI, and structured logging with correlation IDs. Built with FastAPI, SQLAlchemy, and async Python patterns. This very site is powered by it!",
    tech: ["FastAPI", "Python", "SQLAlchemy", "JWT", "Backblaze B2", "DeepAI"],
  },
  {
    title: "Interactive Portfolio Frontend",
    body: "🎨 A modern, responsive portfolio website designed as a social media feed — visitors can register, browse projects as posts, leave comments, and like their favorites. Dark glassmorphism design with smooth animations, built with Next.js App Router, React 19, TypeScript, and Tailwind CSS 4.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    title: "AI Chat Application",
    body: "🤖 An intelligent chatbot application powered by OpenAI's GPT API with a sleek React frontend. Features real-time streaming responses via WebSockets, conversation history, and markdown rendering for rich output formatting.",
    tech: ["Python", "OpenAI API", "React", "WebSockets"],
  },
  {
    title: "Task Management App",
    body: "📋 A collaborative task management application featuring drag-and-drop Kanban boards, real-time updates with Socket.io, user workspaces, and team collaboration. Full CRUD with role-based access control.",
    tech: ["React", "Node.js", "MongoDB", "Socket.io"],
  },
];

const SKILLS = [
  { category: "Languages", items: ["Python", "JavaScript", "TypeScript", "Java", "C++", "SQL"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS"] },
  { category: "Backend", items: ["FastAPI", "Node.js", "REST APIs", "GraphQL"] },
  { category: "Tools & DevOps", items: ["Git", "Docker", "Linux", "VS Code", "PostgreSQL", "SQLite"] },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  /* Auth state */
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authMsg, setAuthMsg] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [confirmUrl, setConfirmUrl] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  /* Feed state */
  const [posts, setPosts] = useState<Post[]>([]);
  const [sorting, setSorting] = useState("new");
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState("");

  /* Interaction state */
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});

  const [globalError, setGlobalError] = useState("");
  const [activeSection, setActiveSection] = useState<"projects" | "about">("projects");

  /* ---- Fetch posts (public) ---- */
  const fetchPosts = useCallback(async (sort: string) => {
    setFeedLoading(true);
    setFeedError("");
    try {
      const res = await fetch(`${API}/post?sorting=${sort}`);
      if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
      const data: Post[] = await res.json();
      setPosts(data);
    } catch {
      setFeedError("Could not reach the API — showing sample projects below.");
      setPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(sorting);
  }, [sorting, fetchPosts]);

  /* ---- Auth handlers ---- */
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthMsg("");
    setAuthLoading(true);
    setConfirmUrl("");

    try {
      if (isRegister) {
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");
        setAuthMsg(data.detail || "Registration successful!");
        if (data.confirmation_url) setConfirmUrl(data.confirmation_url);
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
        setShowAuth(false);
        setAuthEmail("");
        setAuthPass("");
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
    setAuthMsg("");
    setAuthError("");
  };

  /* ---- Post interactions ---- */
  const handleLike = async (postId: number) => {
    if (!token) {
      setShowAuth(true);
      setGlobalError("Please log in to like a project.");
      return;
    }
    setGlobalError("");
    try {
      const res = await fetch(`${API}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ post_id: postId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to like");
      }
      fetchPosts(sorting);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to like");
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const res = await fetch(`${API}/post/${postId}/comment`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data: Comment[] = await res.json();
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
      fetchComments(postId);
    }
  };

  const handleComment = async (e: React.FormEvent, postId: number) => {
    e.preventDefault();
    if (!token) {
      setShowAuth(true);
      setGlobalError("Please log in to comment.");
      return;
    }
    const text = commentTexts[postId]?.trim();
    if (!text) return;
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));
    setGlobalError("");
    try {
      const res = await fetch(`${API}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: text, post_id: postId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to comment");
      }
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      fetchComments(postId);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : "Failed to comment");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  /* ---- Decide what to show in feed ---- */
  const displayPosts = posts.length > 0 ? posts : [];
  const showFallback = posts.length === 0 && !feedLoading;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
          <span className="text-lg font-bold gradient-text">Rabia Zulfiqar</span>

          <div className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => setActiveSection("projects")}
              className={`text-sm transition-colors ${activeSection === "projects" ? "text-primary-light font-medium" : "text-muted hover:text-foreground"}`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveSection("about")}
              className={`text-sm transition-colors ${activeSection === "about" ? "text-primary-light font-medium" : "text-muted hover:text-foreground"}`}
            >
              About &amp; Skills
            </button>
            <a href="https://github.com/rabiazulfiqar1" target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                  {email[0]?.toUpperCase() || "U"}
                </div>
                <button onClick={handleLogout} className="text-sm text-muted hover:text-red-400 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 h-64 w-64 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 right-1/4 h-60 w-60 rounded-full bg-accent/10 blur-3xl animate-float" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 sm:py-20 text-center">
          {/* Avatar */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl shadow-primary/30 animate-fade-in">
            <span className="text-3xl font-bold text-white">RZ</span>
          </div>

          <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-5xl">
            Hi, I&apos;m <span className="gradient-text">Rabia Zulfiqar</span>
          </h1>
          <p className="animate-slide-up-delay mt-3 text-lg text-muted">
            CS Student · Full-Stack Developer · Seeking Opportunities
          </p>
          <p className="animate-slide-up-delay-2 mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            3rd-year Computer Science student passionate about building elegant full-stack applications.
            Browse my projects below — powered by a{" "}
            <span className="text-primary-light font-medium">FastAPI</span> backend that <em>you</em> can interact
            with. <span className="text-accent font-medium">Register, comment, and like</span> your favorites!
          </p>

          <div className="animate-slide-up-delay-2 mt-6 flex flex-wrap items-center justify-center gap-2">
            {["FastAPI", "React", "Next.js", "Python", "SQLAlchemy", "JWT Auth", "Tailwind CSS"].map((b) => (
              <span key={b} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
                {b}
              </span>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4 animate-slide-up-delay-2">
            <a
              href="https://github.com/rabiazulfiqar1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-muted hover:border-primary hover:text-primary-light transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/rabiazulfiqar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm text-muted hover:border-primary hover:text-primary-light transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
            {!token && (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-primary/25 transition-all"
              >
                Sign up to interact
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="mx-auto max-w-3xl px-4 pb-12">
        {/* ---- Global error ---- */}
        {globalError && (
          <div className="mb-6 alert-error flex items-center justify-between">
            <span>{globalError}</span>
            <button onClick={() => setGlobalError("")} className="ml-4 text-lg font-bold hover:text-white">×</button>
          </div>
        )}

        {/* ---- Auth modal overlay ---- */}
        {showAuth && !token && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-card w-full max-w-md p-6 animate-slide-up">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">{isRegister ? "Create Account" : "Welcome Back"}</h2>
                <button onClick={() => setShowAuth(false)} className="text-muted hover:text-foreground text-xl" aria-label="Close authentication modal">×</button>
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
                      <a href={confirmUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm underline hover:text-white">
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
                  {authLoading ? "Please wait…" : isRegister ? "Register" : "Login"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-muted">
                {isRegister ? "Already have an account?" : "Need an account?"}{" "}
                <button
                  onClick={() => { setIsRegister(!isRegister); setAuthError(""); setAuthMsg(""); setConfirmUrl(""); }}
                  className="text-primary-light hover:text-accent transition-colors"
                >
                  {isRegister ? "Login" : "Register"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ═══════════ SECTION: PROJECTS ═══════════ */}
        {activeSection === "projects" && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold">
                <span className="gradient-text">Projects</span>
                <span className="ml-2 text-sm font-normal text-muted">— like a feed, but it&apos;s my work</span>
              </h2>

              {/* Sort controls */}
              <div className="flex gap-2">
                {(["new", "old", "most_likes"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSorting(s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      sorting === s
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20"
                        : "bg-surface-light/50 text-muted hover:text-foreground hover:bg-surface-light"
                    }`}
                  >
                    {s === "most_likes" ? "🔥 Most Liked" : s === "new" ? "🆕 Newest" : "📅 Oldest"}
                  </button>
                ))}
                <button
                  onClick={() => fetchPosts(sorting)}
                  disabled={feedLoading}
                  className="rounded-lg px-3 py-1.5 text-xs text-muted border border-border hover:border-primary hover:text-primary-light transition-all disabled:opacity-50"
                >
                  ↻
                </button>
              </div>
            </div>

            {feedError && <div className="alert-error text-sm">{feedError}</div>}

            {feedLoading && displayPosts.length === 0 && (
              <div className="glass-card p-12 text-center text-muted">Loading projects…</div>
            )}

            {/* ---- Backend posts ---- */}
            {displayPosts.map((post) => (
              <article key={post.id} className="glass-card p-6 hover:glass-card-hover group">
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    RZ
                  </div>
                  <div>
                    <span className="text-sm font-medium">Rabia Zulfiqar</span>
                    <span className="ml-2 text-xs text-muted">· Project #{post.id}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

                {post.image_url && (
                  <img src={post.image_url} alt="Project screenshot" className="mt-4 w-full rounded-xl object-cover max-h-72" />
                )}

                {/* Action bar */}
                <div className="mt-4 flex items-center gap-5 border-t border-border/40 pt-3">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 text-sm text-muted hover:text-red-400 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes}
                  </button>
                  <button onClick={() => toggleExpand(post.id)} className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comments
                  </button>
                </div>

                {/* Comments panel */}
                {expandedPost === post.id && (
                  <div className="mt-4 space-y-3 border-t border-border/40 pt-4">
                    {comments[post.id]?.length === 0 && (
                      <p className="text-xs text-muted text-center">No comments yet — be the first!</p>
                    )}
                    {comments[post.id]?.map((c) => (
                      <div key={c.id} className="flex gap-3 rounded-lg bg-surface/50 p-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                          {c.user_id}
                        </div>
                        <p className="text-sm text-muted">{c.body}</p>
                      </div>
                    ))}
                    <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={commentTexts[post.id] || ""}
                        onChange={(e) => setCommentTexts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        placeholder={token ? "Write a comment…" : "Sign in to comment…"}
                        className="input-field focus:input-field-focus flex-1"
                      />
                      <button
                        type="submit"
                        disabled={commentLoading[post.id] || !commentTexts[post.id]?.trim()}
                        className="gradient-btn hover:gradient-btn-hover text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {commentLoading[post.id] ? "…" : "Reply"}
                      </button>
                    </form>
                  </div>
                )}
              </article>
            ))}

            {/* ---- Fallback: static project cards when backend has no posts ---- */}
            {showFallback && (
              <div className="space-y-5">
                <p className="text-sm text-muted text-center">
                  No posts in the API yet — here are my projects. Start the backend and post them to enable likes &amp; comments!
                </p>
                {PORTFOLIO_PROJECTS.map((proj, i) => (
                  <div key={i} className="glass-card p-6">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">RZ</div>
                      <span className="text-sm font-medium">Rabia Zulfiqar</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-primary-light">{proj.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{proj.body}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proj.tech.map((t) => (
                        <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary-light">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══════════ SECTION: ABOUT & SKILLS ═══════════ */}
        {activeSection === "about" && (
          <section className="space-y-8 animate-fade-in">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-4">
                About <span className="gradient-text">Me</span>
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted">
                <p>
                  I&apos;m a <span className="text-primary-light font-semibold">3rd-year Computer Science</span> undergraduate passionate about software engineering.
                  I thrive on building full-stack web applications and exploring the intersection of <span className="text-accent font-semibold">AI</span> and modern web technologies.
                </p>
                <p>
                  I&apos;m actively seeking <span className="text-secondary font-semibold">software engineering internships and full-time opportunities</span> where I can apply my skills and grow as a developer.
                </p>
                <p>
                  This site itself is a showcase of my work — it&apos;s built with <span className="text-primary-light">Next.js</span> on the frontend and <span className="text-accent">FastAPI</span> on the backend.
                  The projects you see in the feed are stored in a real database, and the like/comment features use JWT authentication, password hashing, and async SQLAlchemy.
                </p>
              </div>
            </div>

            {/* Education */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">🎓 Education</h3>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xl">🎓</div>
                <div>
                  <p className="font-semibold">Bachelor of Science in Computer Science</p>
                  <p className="text-sm text-accent">Expected Graduation: 2026</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Data Structures", "Algorithms", "Database Systems", "Software Engineering", "Machine Learning", "Operating Systems"].map((c) => (
                      <span key={c} className="rounded-full border border-border bg-surface-light/50 px-3 py-1 text-xs text-muted">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">🛠 Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SKILLS.map((cat) => (
                  <div key={cat.category} className="rounded-xl bg-surface/50 p-4">
                    <h4 className="text-sm font-semibold text-primary-light mb-2">{cat.category}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((s) => (
                        <span key={s} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-3">📬 Get in Touch</h3>
              <div className="space-y-3">
                {[
                  { icon: "📧", label: "Email", value: "rabia.zulfiqar@email.com", href: "mailto:rabia.zulfiqar@email.com" },
                  { icon: "🐙", label: "GitHub", value: "github.com/rabiazulfiqar1", href: "https://github.com/rabiazulfiqar1" },
                  { icon: "💼", label: "LinkedIn", value: "linkedin.com/in/rabiazulfiqar", href: "https://linkedin.com/in/rabiazulfiqar" },
                ].map((c) => (
                  <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg bg-surface/50 p-3 hover:bg-surface-light/60 transition-colors">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">{c.label}</p>
                      <p className="text-sm font-medium">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-border py-6 px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Rabia Zulfiqar · CS 3rd Year
          </p>
          <p className="text-sm text-muted">
            Powered by <span className="text-accent">FastAPI</span> + <span className="text-primary-light">Next.js</span>
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/rabiazulfiqar1" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary-light transition-colors" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com/in/rabiazulfiqar" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary-light transition-colors" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
