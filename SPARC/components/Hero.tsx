"use client";

interface HeroProps {
  onJoinUsClick?: () => void;
}

export default function Hero({ onJoinUsClick }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Neon grid floor */}
      <div className="absolute inset-x-0 bottom-0 top-1/3 retro-grid z-0" />
      {/* Glow blooms */}
      <div className="absolute left-1/2 top-1/4 -translate-x-1/2 w-[70vw] h-[70vw] max-w-[720px] max-h-[720px] rounded-full bg-[#4f8cff]/10 blur-[120px] z-0" />
      <div className="absolute right-[10%] top-1/3 w-[40vw] h-[40vw] max-w-[420px] max-h-[420px] rounded-full bg-[#22d3ee]/10 blur-[110px] z-0" />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 lg:px-8 py-12 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="neo-chip px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] animate-float-slow">
            ● SPARC Student Club
          </span>

          <h1 className="font-display font-extrabold tracking-tight leading-[1.05] text-5xl sm:text-6xl md:text-7xl">
            <span className="block text-[#ffffff]">Master</span>
            <span className="grad-text block text-glow">Robotics &amp; Code</span>
          </h1>

          <p className="text-lg md:text-2xl text-[#ffffff]/75 max-w-2xl mx-auto leading-relaxed">
            Where innovation meets hands-on learning. Build robots, write code,
            and battle it out in our neon arcade.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onJoinUsClick}
              className="neo-btn neo-btn-primary px-8 py-4 text-base md:text-lg w-full sm:w-auto"
            >
              Join SPARC Today
            </button>
            <a
              href="/games"
              className="neo-btn neo-btn-ghost px-8 py-4 text-base md:text-lg w-full sm:w-auto"
            >
              ▶ Play the Arcade
            </a>
          </div>

          {/* Feature chips */}
          <div className="pt-8 flex flex-wrap justify-center gap-3">
            {["Hands-On Projects", "Industry Mentors", "Competition Ready"].map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#ffffff]/80"
              >
                <svg className="w-4 h-4 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-[#ffffff]/50">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
