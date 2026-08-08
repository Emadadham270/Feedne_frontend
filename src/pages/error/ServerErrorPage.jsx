import { useState } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ServerErrorPage({ onRetry }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
    setTimeout(() => setIsRetrying(false), 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#0B3CC4] text-white select-none overflow-hidden relative p-6">
      {/* Top Header / Title Section */}
      <div className="w-full max-w-xl text-center space-y-3 z-10 pt-8 sm:pt-12">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
          Server Outage!
        </h1>
        <p className="text-sm sm:text-lg text-blue-100 font-medium max-w-md mx-auto leading-relaxed">
          The cat unplugged the server wire! Our engineers are plugging it back in...
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-8 py-3 rounded-full bg-white hover:bg-blue-50 active:scale-95 text-[#0B3CC4] font-bold text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75"
          >
            <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Reconnecting...' : 'Try Again'}</span>
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-blue-800/60 hover:bg-blue-800 text-white font-medium text-sm border border-blue-400/30 transition-colors flex items-center gap-2"
          >
            <Home size={16} />
            <span>Homepage</span>
          </Link>
        </div>
      </div>

      {/* Main Vector Scene: Blue Server Racks + Unplugged Socket + Black Cat */}
      <div className="w-full max-w-5xl flex-1 flex items-end justify-center relative z-0 mt-6 -mb-6">
        <svg viewBox="0 0 1000 450" className="w-full max-h-[420px] object-contain overflow-visible">
          {/* Ground / Floor Line */}
          <rect x="0" y="420" width="1000" height="30" fill="#082EA3" />

          {/* Left Server Rack 1 */}
          <g transform="translate(40, 40)">
            {/* Outer Tower Cabinet */}
            <rect x="0" y="0" width="120" height="380" rx="4" fill="#2563EB" stroke="#1D4ED8" strokeWidth="4" />
            {/* Blades / Drive Bay Slots */}
            {Array.from({ length: 16 }).map((_, i) => (
              <g key={i} transform={`translate(8, ${12 + i * 22.5})`}>
                <rect x="0" y="0" width="104" height="17" rx="2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
                {/* Grid slots */}
                <line x1="10" y1="8.5" x2="80" y2="8.5" stroke="#60A5FA" strokeWidth="3" strokeDasharray="4 2" />
                {/* Status LED Lights */}
                <circle cx="88" cy="8.5" r="2" fill="#60A5FA" />
                <circle cx="95" cy="8.5" r="2" fill="#93C5FD" />
              </g>
            ))}
          </g>

          {/* Main Server Rack 2 (Center-Left) */}
          <g transform="translate(170, 0)">
            {/* Cabinet */}
            <rect x="0" y="0" width="280" height="420" rx="6" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="4" />
            
            {/* Blades */}
            {Array.from({ length: 18 }).map((_, i) => (
              <g key={i} transform={`translate(16, ${14 + i * 21.5})`}>
                <rect x="0" y="0" width="248" height="16" rx="3" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                {/* Blade Handles & Vents */}
                <rect x="8" y="3" width="20" height="10" rx="1" fill="#1E40AF" />
                <rect x="220" y="3" width="20" height="10" rx="1" fill="#1E40AF" />
                <line x1="36" y1="8" x2="210" y2="8" stroke="#93C5FD" strokeWidth="4" strokeDasharray="6 3" />
                <circle cx="205" cy="8" r="2" fill="#60A5FA" />
                <circle cx="198" cy="8" r="2" fill="#93C5FD" />
              </g>
            ))}
          </g>

          {/* Floor Power Cable connecting from Server 2 to Wall Outlet */}
          <path
            d="M 450 380 Q 550 430 650 415"
            fill="none"
            stroke="#082EA3"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 450 380 Q 550 430 650 415"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Unplugged 2-Prong Male Plug near Wall Socket */}
          <g transform="translate(642, 400) rotate(12)">
            <rect x="0" y="0" width="22" height="16" rx="3" fill="#1E3A8A" />
            {/* Metal Prongs */}
            <rect x="22" y="3" width="10" height="3.5" rx="1" fill="#93C5FD" />
            <rect x="22" y="9.5" width="10" height="3.5" rx="1" fill="#93C5FD" />
          </g>

          {/* Wall Outlet Socket */}
          <g transform="translate(650, 310)">
            <rect x="0" y="0" width="40" height="60" rx="10" fill="#60A5FA" stroke="#93C5FD" strokeWidth="3" />
            {/* Socket Slots */}
            <rect x="14" y="15" width="4" height="12" rx="1" fill="#1E3A8A" />
            <rect x="22" y="15" width="4" height="12" rx="1" fill="#1E3A8A" />

            <rect x="14" y="35" width="4" height="12" rx="1" fill="#1E3A8A" />
            <rect x="22" y="35" width="4" height="12" rx="1" fill="#1E3A8A" />
          </g>

          {/* Sleek Black Cat sitting on the right */}
          <g transform="translate(760, 260)">
            {/* Tail */}
            <path
              d="M 10 150 C -40 140 -30 110 0 115"
              fill="none"
              stroke="#111827"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Cat Body */}
            <ellipse cx="60" cy="110" rx="45" ry="55" fill="#111827" />

            {/* Cat Head */}
            <circle cx="60" cy="45" r="32" fill="#111827" />

            {/* Cat Ears */}
            {/* Left Ear */}
            <polygon points="32,32 45,5 58,28" fill="#111827" />
            <polygon points="36,30 45,12 54,27" fill="#1F2937" />

            {/* Right Ear */}
            <polygon points="62,28 75,5 88,32" fill="#111827" />
            <polygon points="66,27 75,12 84,30" fill="#1F2937" />

            {/* Cat Eyes (Wide & Innocent looking forward) */}
            {/* Left Eye */}
            <ellipse cx="46" cy="42" rx="9" ry="7" fill="#FFFFFF" />
            <ellipse cx="46" cy="42" rx="6" ry="6" fill="#111827" />
            <circle cx="44" cy="40" r="2" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="74" cy="42" rx="9" ry="7" fill="#FFFFFF" />
            <ellipse cx="74" cy="42" rx="6" ry="6" fill="#111827" />
            <circle cx="72" cy="40" r="2" fill="#FFFFFF" />

            {/* Nose & Whiskers */}
            <polygon points="60,50 56,47 64,47" fill="#F472B6" />
            
            {/* Whiskers Left */}
            <line x1="45" y1="52" x2="10" y2="46" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="45" y1="55" x2="12" y2="57" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Whiskers Right */}
            <line x1="75" y1="52" x2="110" y2="46" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="75" y1="55" x2="108" y2="57" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}
