import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F0C29] text-white p-6 select-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6 z-10 my-auto">
        {/* Lock Graphic */}
        <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <Lock size={44} className="text-purple-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Access Denied!
          </h1>
          <p className="text-xs sm:text-sm text-purple-200/80 font-normal leading-relaxed max-w-xs mx-auto">
            This area is restricted or private. You need authorization or approved follow request to access this page.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-sm transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
