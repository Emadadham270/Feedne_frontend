import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#030712] text-white p-6 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center text-center space-y-6 z-10 my-auto">
        {/* 404 Glowing Orb Header */}
        <div className="flex items-center justify-center gap-2 text-7xl sm:text-8xl font-extrabold tracking-tighter text-blue-900/60 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <span>4</span>

          {/* Central Memory Sphere Orb */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-700 p-0.5 shadow-[0_0_35px_rgba(59,130,246,0.8)] border border-cyan-300/40 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-300/40 via-blue-600/50 to-transparent animate-pulse" />
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
              {/* Silhouette sitting on tree branch inside orb memory */}
              <path d="M 20 70 Q 50 65 80 75 M 40 67 L 40 50" stroke="#030712" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="52" cy="48" r="8" fill="#030712" />
              <path d="M 52 56 L 52 68 M 52 60 L 44 65 M 52 60 L 60 65" stroke="#030712" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>

          <span>4</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
          Nothing Here. Sorry !
        </h1>

        {/* Subtitle / Core Memory Quote */}
        <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed max-w-md mx-auto px-4">
          I guess the page you were looking for... it rolled away with my emotional core memory. You can&apos;t go that fast... Let&apos;s just sit for a bit, and then we can go back. I&apos;ll wait for you...
        </p>

        {/* Go To Homepage Button */}
        <div className="pt-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#1C64F2] hover:bg-[#1A56DB] active:scale-95 text-white font-medium text-sm shadow-[0_0_25px_rgba(28,100,242,0.6)] transition-all duration-200"
          >
            Go To Homepage
          </Link>
        </div>
      </div>

      {/* Bottom Character Artwork: Sadness looking up */}
      <div className="w-full max-w-sm flex justify-center z-10 pt-4 -mb-4">
        <svg viewBox="0 0 200 150" className="w-64 h-48 drop-shadow-[0_-10px_20px_rgba(30,58,138,0.4)]">
          <defs>
            <linearGradient id="sadnessHair" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="sadnessSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          {/* Hair Top Dome */}
          <path
            d="M 30 150 C 30 60 70 20 100 20 C 130 20 170 60 170 150 Z"
            fill="url(#sadnessHair)"
          />

          {/* Hair Bangs & Texture */}
          <path d="M 40 70 Q 70 30 100 35 Q 130 30 160 70" fill="none" stroke="#3B82F6" strokeWidth="4" opacity="0.6" />
          <path d="M 50 50 Q 100 15 150 50" fill="none" stroke="#60A5FA" strokeWidth="3" opacity="0.5" />

          {/* Face Base */}
          <path
            d="M 50 150 C 50 90 75 75 100 75 C 125 75 150 90 150 150 Z"
            fill="url(#sadnessSkin)"
          />

          {/* Round Glasses */}
          {/* Left Frame */}
          <circle cx="78" cy="105" r="22" fill="none" stroke="#1D4ED8" strokeWidth="4.5" />
          <circle cx="78" cy="105" r="22" fill="none" stroke="#1E3A8A" strokeWidth="3" />
          
          {/* Right Frame */}
          <circle cx="122" cy="105" r="22" fill="none" stroke="#1D4ED8" strokeWidth="4.5" />
          <circle cx="122" cy="105" r="22" fill="none" stroke="#1E3A8A" strokeWidth="3" />

          {/* Bridge */}
          <path d="M 100 105 L 100 105" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" />

          {/* Eyes looking UP */}
          {/* Left Eye */}
          <ellipse cx="78" cy="104" rx="14" ry="15" fill="#FFFFFF" />
          <ellipse cx="80" cy="98" rx="8" ry="9" fill="#1D4ED8" />
          <ellipse cx="81" cy="96" rx="4" ry="4.5" fill="#0284C7" />
          <circle cx="79" cy="94" r="2.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="122" cy="104" rx="14" ry="15" fill="#FFFFFF" />
          <ellipse cx="120" cy="98" rx="8" ry="9" fill="#1D4ED8" />
          <ellipse cx="119" cy="96" rx="4" ry="4.5" fill="#0284C7" />
          <circle cx="121" cy="94" r="2.5" fill="#FFFFFF" />

          {/* Eyebrows (Sad tilt) */}
          <path d="M 62 80 Q 75 75 88 84" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 112 84 Q 125 75 138 80" stroke="#1E3A8A" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Soft Sad Mouth */}
          <path d="M 92 135 Q 100 131 108 135" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}
