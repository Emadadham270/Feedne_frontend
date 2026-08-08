import { useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

export function NoInternetPage({ onRetry }) {
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F9F8F0] dark:bg-[#161614] text-[#1D1D1F] dark:text-[#E5E5E7] p-6 transition-colors select-none">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 animate-fade-in">
        {/* Vector Illustration: Mouse cutting Wi-Fi wire */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-sm overflow-visible">
            {/* Wi-Fi Waves coming from tail wire */}
            <g className="animate-pulse">
              <path d="M 175 42 A 22 22 0 0 1 205 42" stroke="#2C2C2E" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 180 50 A 15 15 0 0 1 200 50" stroke="#2C2C2E" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 185 58 A 8 8 0 0 1 195 58" stroke="#2C2C2E" strokeWidth="4" strokeLinecap="round" fill="none" />
              <circle cx="190" cy="65" r="3" fill="#2C2C2E" />
            </g>

            {/* Mouse Body Back & Tail */}
            <path
              d="M 190 68 C 190 100 195 130 170 145 C 150 155 130 145 110 150 C 90 155 60 160 30 175 C 60 180 100 175 125 160 C 155 145 185 135 185 105 Z"
              fill="#2C2C2E" stroke="#2C2C2E" strokeWidth="3" strokeLinecap="round"
            />
            {/* Pinkish Tail Line */}
            <path
              d="M 140 156 C 170 150 200 135 190 68"
              fill="none" stroke="#2C2C2E" strokeWidth="4.5" strokeLinecap="round"
            />
            <path
              d="M 140 156 C 160 155 195 165 210 140 C 220 120 200 100 180 110"
              fill="none" stroke="#E89B93" strokeWidth="4" strokeLinecap="round"
            />

            {/* Mouse Main Body */}
            <ellipse cx="120" cy="130" rx="38" ry="32" fill="#757371" stroke="#2A2928" strokeWidth="3" />
            
            {/* Mouse Head */}
            <path
              d="M 105 110 C 85 105 75 115 80 128 C 85 140 105 138 120 132 Z"
              fill="#757371" stroke="#2A2928" strokeWidth="3"
            />

            {/* Ears */}
            {/* Left Ear */}
            <circle cx="102" cy="82" r="20" fill="#757371" stroke="#2A2928" strokeWidth="3" />
            <circle cx="102" cy="82" r="13" fill="#E89B93" />

            {/* Right Ear */}
            <circle cx="132" cy="85" r="22" fill="#757371" stroke="#2A2928" strokeWidth="3" />
            <circle cx="132" cy="85" r="14" fill="#E89B93" />

            {/* Eyes */}
            {/* Left Eye */}
            <ellipse cx="98" cy="108" rx="6" ry="8" fill="#FFFFFF" stroke="#2A2928" strokeWidth="2" />
            <circle cx="97" cy="108" r="3.5" fill="#2A2928" />
            <circle cx="96" cy="106" r="1.2" fill="#FFFFFF" />

            {/* Right Eye */}
            <ellipse cx="115" cy="109" rx="6" ry="8" fill="#FFFFFF" stroke="#2A2928" strokeWidth="2" />
            <circle cx="114" cy="109" r="3.5" fill="#2A2928" />
            <circle cx="113" cy="107" r="1.2" fill="#FFFFFF" />

            {/* Pink Nose */}
            <ellipse cx="86" cy="120" rx="4.5" ry="3.5" fill="#E89B93" stroke="#2A2928" strokeWidth="1.5" />
            {/* Whiskers */}
            <line x1="82" y1="120" x2="65" y2="114" stroke="#2A2928" strokeWidth="2" strokeLinecap="round" />
            <line x1="82" y1="122" x2="64" y2="125" stroke="#2A2928" strokeWidth="2" strokeLinecap="round" />

            {/* Paws */}
            {/* Paws holding scissors */}
            <ellipse cx="88" cy="138" rx="7" ry="5" fill="#E89B93" stroke="#2A2928" strokeWidth="2" />
            <ellipse cx="115" cy="144" rx="7" ry="5" fill="#E89B93" stroke="#2A2928" strokeWidth="2" />
            <ellipse cx="132" cy="147" rx="8" ry="4.5" fill="#757371" stroke="#2A2928" strokeWidth="2" />

            {/* Scissors */}
            <g transform="translate(62, 126) rotate(-20)">
              <circle cx="8" cy="8" r="7" fill="none" stroke="#2A2928" strokeWidth="3" />
              <circle cx="8" cy="22" r="7" fill="none" stroke="#2A2928" strokeWidth="3" />
              <line x1="14" y1="10" x2="32" y2="20" stroke="#757371" strokeWidth="3" strokeLinecap="round" />
              <line x1="14" y1="20" x2="32" y2="10" stroke="#757371" strokeWidth="3" strokeLinecap="round" />
              <circle cx="23" cy="15" r="2" fill="#2A2928" />
            </g>

            {/* Cut Cable & Sparks */}
            <path d="M 35 155 C 50 152 70 148 76 142" fill="none" stroke="#2C2C2E" strokeWidth="4" strokeLinecap="round" />
            {/* Cut Sparks */}
            <path d="M 45 138 L 41 132 M 52 136 L 54 128 M 38 147 L 30 146" stroke="#2A2928" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
            No internet?
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#8A8A8E] dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Blame the rat! He thought the Wi-Fi wire was a snack!
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-8 py-2.5 rounded-full bg-[#8E8E93] hover:bg-[#7C7C80] active:scale-95 text-white dark:text-neutral-900 font-semibold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
            <span>{isRetrying ? 'Checking...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
