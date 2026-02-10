const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Contact", href: "#contact" },
];

const skillCategories = [
  {
    title: "Languages",
    icon: "💻",
    skills: [
      { name: "Python", level: 90 },
      { name: "JavaScript", level: 85 },
      { name: "TypeScript", level: 80 },
      { name: "Java", level: 75 },
      { name: "C++", level: 70 },
    ],
  },
  {
    title: "Frontend",
    icon: "🎨",
    skills: [
      { name: "React", level: 85 },
      { name: "Next.js", level: 80 },
      { name: "HTML/CSS", level: 90 },
      { name: "Tailwind CSS", level: 85 },
    ],
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: [
      { name: "FastAPI", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "REST APIs", level: 90 },
      { name: "SQL", level: 80 },
    ],
  },
  {
    title: "Tools",
    icon: "🛠️",
    skills: [
      { name: "Git", level: 90 },
      { name: "Docker", level: 70 },
      { name: "VS Code", level: 95 },
      { name: "Linux", level: 75 },
    ],
  },
];

const projects = [
  {
    title: "Social Media API",
    description:
      "A full-featured RESTful API for a social media platform with user authentication, CRUD operations, and vote functionality. Built with modern Python best practices.",
    tech: ["FastAPI", "Python", "SQLAlchemy", "JWT Auth", "PostgreSQL"],
    link: "#",
  },
  {
    title: "Portfolio Website",
    description:
      "A modern, responsive portfolio website built with Next.js and Tailwind CSS featuring glassmorphism design, smooth animations, and dark theme.",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    link: "#",
  },
  {
    title: "AI Chat Application",
    description:
      "An intelligent chatbot application powered by OpenAI's GPT API with a sleek React frontend and real-time streaming responses.",
    tech: ["Python", "OpenAI API", "React", "WebSockets"],
    link: "#",
  },
  {
    title: "Task Management App",
    description:
      "A collaborative task management application with drag-and-drop boards, real-time updates, and team workspace features.",
    tech: ["React", "Node.js", "MongoDB", "Socket.io"],
    link: "#",
  },
];

const experiences = [
  {
    role: "Software Engineering Intern",
    company: "Tech Company",
    period: "Summer 2024",
    description:
      "Developed and maintained full-stack web applications. Collaborated with cross-functional teams to deliver features on time. Improved API response times by 30% through query optimization.",
  },
  {
    role: "Teaching Assistant — Data Structures",
    company: "University CS Department",
    period: "Sep 2023 – May 2024",
    description:
      "Assisted professors in teaching data structures and algorithms to 120+ students. Conducted weekly office hours and graded assignments. Created supplementary learning materials.",
  },
  {
    role: "Freelance Web Developer",
    company: "Self-Employed",
    period: "Jan 2023 – Present",
    description:
      "Designed and developed responsive websites for small businesses and startups. Delivered 5+ projects using modern web technologies including React and Next.js.",
  },
];

const coursework = [
  "Data Structures",
  "Algorithms",
  "Database Systems",
  "Software Engineering",
  "Machine Learning",
  "Operating Systems",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <a href="#" className="text-xl font-bold gradient-text">
            RZ
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-primary-light transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/25"
          >
            Hire Me
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-secondary/15 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 right-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl animate-float" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="animate-fade-in mb-4 text-lg text-accent font-mono">
            Hello, World! 👋
          </p>
          <h1 className="animate-slide-up text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            I&apos;m{" "}
            <span className="gradient-text">Rabia Zulfiqar</span>
          </h1>
          <div className="animate-slide-up-delay mt-6 overflow-hidden">
            <p className="font-mono text-lg text-muted sm:text-xl">
              Computer Science Student | Aspiring Software Engineer
            </p>
          </div>
          <p className="animate-slide-up-delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            A passionate 3rd-year Computer Science student crafting elegant
            solutions through code. I love building full-stack applications,
            exploring AI, and turning complex problems into simple, beautiful
            experiences.
          </p>
          <div className="animate-slide-up-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#projects"
              className="rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-3 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-105"
            >
              View My Projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-border px-8 py-3 font-medium text-foreground transition-all duration-300 hover:border-primary hover:text-primary-light hover:scale-105"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="section-padding">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-2xl shadow-primary/20">
                <span className="text-6xl font-bold text-white">RZ</span>
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-pulse-slow" />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <p className="text-lg leading-relaxed text-muted">
                I&apos;m a <span className="text-primary-light font-semibold">3rd-year Computer Science</span> undergraduate
                student with a deep passion for software development. I thrive on
                building full-stack web applications and exploring the
                intersection of <span className="text-accent font-semibold">artificial intelligence</span> and modern web
                technologies.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                When I&apos;m not coding, you&apos;ll find me contributing to open-source
                projects, participating in hackathons, or mentoring fellow
                students. I&apos;m actively seeking{" "}
                <span className="text-secondary font-semibold">
                  software engineering internships and full-time opportunities
                </span>{" "}
                where I can make a meaningful impact.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "3rd Year CS", icon: "🎓" },
                  { label: "Full Stack Dev", icon: "🚀" },
                  { label: "Problem Solver", icon: "🧩" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-4 text-center hover:glass-card-hover"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" className="section-padding bg-surface/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            My <span className="gradient-text">Skills</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {skillCategories.map((category) => (
              <div
                key={category.title}
                className="glass-card p-6 hover:glass-card-hover"
              >
                <div className="mb-4 text-center">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="mt-2 text-lg font-semibold gradient-text-accent">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{skill.name}</span>
                        <span className="text-muted">{skill.level}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-light">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROJECTS ===== */}
      <section id="projects" className="section-padding">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.title}
                className="glass-card group p-6 hover:glass-card-hover"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">📂</span>
                  <a
                    href={project.link}
                    className="text-muted transition-colors hover:text-primary-light"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary-light transition-colors">
                  {project.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section id="experience" className="section-padding bg-surface/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            My <span className="gradient-text">Experience</span>
          </h2>
          <div className="relative pl-12">
            <div className="timeline-line" />
            <div className="space-y-12">
              {experiences.map((exp) => (
                <div key={exp.role} className="relative">
                  <div className="timeline-dot" />
                  <div className="glass-card p-6 hover:glass-card-hover">
                    <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <h3 className="text-lg font-semibold text-foreground">
                        {exp.role}
                      </h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
                        {exp.period}
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-accent">
                      {exp.company}
                    </p>
                    <p className="text-sm leading-relaxed text-muted">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== EDUCATION ===== */}
      <section id="education" className="section-padding">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
            My <span className="gradient-text">Education</span>
          </h2>
          <div className="glass-card p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                <span className="text-3xl">🎓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">
                  Bachelor of Science in Computer Science
                </h3>
                <p className="mt-1 text-accent font-medium">
                  University Name
                </p>
                <p className="mt-1 text-sm text-muted">
                  Expected Graduation: 2026
                </p>
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-light">
                    Relevant Coursework
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {coursework.map((course) => (
                      <span
                        key={course}
                        className="rounded-full border border-border bg-surface-light/50 px-4 py-1.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary-light"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section-padding bg-surface/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-muted">
            I&apos;m always open to new opportunities and collaborations.
            Let&apos;s connect and build something amazing together!
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                {
                  icon: "📧",
                  label: "Email",
                  value: "rabia.zulfiqar@email.com",
                  href: "mailto:rabia.zulfiqar@email.com",
                },
                {
                  icon: "💼",
                  label: "LinkedIn",
                  value: "linkedin.com/in/rabiazulfiqar",
                  href: "https://linkedin.com/in/rabiazulfiqar",
                },
                {
                  icon: "🐙",
                  label: "GitHub",
                  value: "github.com/rabiazulfiqar",
                  href: "https://github.com/rabiazulfiqar",
                },
              ].map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  className="glass-card flex items-center gap-4 p-4 hover:glass-card-hover"
                >
                  <span className="text-2xl">{contact.icon}</span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted">
                      {contact.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {contact.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Form (visual only) */}
            <div className="glass-card p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition-colors focus:border-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition-colors focus:border-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-muted">
                    Message
                  </label>
                  <textarea
                    placeholder="Your message..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition-colors focus:border-primary"
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                >
                  Send Message
                </button>
                <p className="text-center text-xs text-muted/60">
                  Demo form — not yet connected to a backend
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Rabia Zulfiqar. All rights reserved.
          </p>
          <p className="text-sm text-muted">
            Built with{" "}
            <span className="text-primary-light">Next.js</span> &amp;{" "}
            <span className="text-accent">Tailwind CSS</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/rabiazulfiqar"
              className="text-muted transition-colors hover:text-primary-light"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/rabiazulfiqar"
              className="text-muted transition-colors hover:text-primary-light"
              aria-label="LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
