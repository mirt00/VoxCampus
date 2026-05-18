import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H6.42a.75.75 0 00-.707.5l-1.29 3.75a.75.75 0 00.707 1h1.292m11.25 0h1.293a.75.75 0 00.707-1l-1.29-3.75a.75.75 0 00-.707-.5H15.75m0 0V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
      </svg>
    ),
    title: "Duplicate Detection",
    description: "Smart NLP-driven complaint filtering prevents redundant submissions using TF-IDF cosine similarity.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Dynamic Ranking",
    description: "Community upvotes combined with time-decay algorithm surface the most pressing issues first.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Automated Escalation",
    description: "Unresolved suggestions auto-escalate to the Campus Chief with full history and accountability.",
  },
];

export default function Gateway() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-dark to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* College logo circle */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg border-2 border-white/80 flex items-center justify-center overflow-hidden">
              <img
                src="/onlylogo.png"
                alt="Kathmandu Shiksha Campus"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Glassmorphism card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-blue-200 to-accent bg-clip-text text-transparent">
                VoxCampus 
              </span>
            </h1>
            <p className="text-base md:text-lg text-blue-200/70 max-w-2xl mx-auto leading-relaxed">
              Empowering students through intelligent infrastructure recovery and transparent feedback.
            </p>

            <p className="mt-6 text-sm md:text-base text-white/60 max-w-3xl mx-auto leading-relaxed">
              Kathmandu Shiksha Campus is a premier community-based academic institution dedicated to
              providing high-quality, student-centered education — fostering responsive learning through
              behavioral, practical, and skill-based teaching methodologies.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              {/* External link */}
              <a
                href="https://ksc.edu.np/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-sm
                           hover:bg-white/10 transition-all duration-200 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Visit Main College Website
              </a>

              {/* Portal link */}
              <Link
                to="/auth"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent text-gray-950 font-bold text-sm
                           hover:bg-yellow-500 transition-all duration-200 active:scale-[0.97] shadow-lg shadow-accent/25"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Access Vox Campus Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              How It Works
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
              Three intelligent layers power the DSIR Engine to ensure every voice is heard and acted upon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7
                           hover:bg-white/[0.07] hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5
                                group-hover:bg-accent/20 transition-colors duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT KSC ──────────────────────────────────── */}
      <section className="relative py-24 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              About Kathmandu Shiksha Campus
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
              A premier community-based academic institution dedicated to providing high-quality,
              student-centered education. As a pioneer in its field, the campus fosters a responsive
              and conducive learning environment that emphasizes behavioral, practical, and skill-based
              teaching methodologies. KSC is committed to educating the leaders of tomorrow through a
              blend of innovative academic programs and diverse co-curricular activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Management */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:border-accent/30 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-3">Management</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Master of Business Studies (MBS)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Bachelor of Business Studies (BBS)
                </li>
              </ul>
            </div>

            {/* IT */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:border-accent/30 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-3">Information Technology</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Bachelor of Computer Application (BCA)
                </li>
              </ul>
            </div>

            {/* Education */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:border-accent/30 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-3">Education</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Master of Education (M.Ed.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Bachelor of Education (B.Ed.)
                </li>
              </ul>
            </div>

            {/* Trainings */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:border-accent/30 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-3">Professional Trainings</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Computer Training
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  Library Training
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
              With a focus on research, academic excellence, and community service, Kathmandu Shiksha
              Campus serves as a transformative platform where students can ignite their passions and
              achieve their academic and professional goals.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-extrabold text-accent">KSC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Kathmandu Shiksha Campus</p>
              <p className="text-xs text-gray-500">Est. 2001</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            &copy; 2026 Vox Campus | Kathmandu Shiksha Campus
          </p>
        </div>
      </footer>
    </div>
  );
}
