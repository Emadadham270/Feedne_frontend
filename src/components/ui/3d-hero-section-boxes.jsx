import React from 'react';
import Spline from '@splinetool/react-spline';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

function HeroSplineBackground() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      pointerEvents: 'auto',
      overflow: 'hidden',
    }}>
      <Spline
        style={{
          width: '100%',
          height: '100vh',
          pointerEvents: 'auto',
        }}
        scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.85), transparent 35%, transparent 65%, rgba(0, 0, 0, 0.85)),
            linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.95))
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-orange-500 tracking-tight">feedne</span>
        </Link>

        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="border border-white/80 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-black transition duration-300 cursor-pointer shadow-sm"
        >
          Log In
        </button>
      </div>
    </nav>
  );
}

function HeroContent() {
  const navigate = useNavigate();

  return (
    <div className="text-white px-6 max-w-screen-xl mx-auto w-full flex flex-col justify-center items-center py-12 relative z-10">

      {/* Top Sentence Header: From " I did " to " How I did " */}
      <div className="w-full mb-6 md:mb-10 text-center pointer-events-none select-none overflow-visible px-4">
        <span
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-400 drop-shadow-[0_4px_16px_rgba(255,92,53,0.5)] inline-block pr-6 transform -rotate-1"
          style={{ fontFamily: "'Caveat', 'Kalam', cursive" }}
        >
          From &quot; I did &quot; to &quot; How I did &quot;
        </span>
      </div>

      {/* Hero Content Columns */}
      <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mb-6 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight tracking-tight">
            Welcome to<br />Feedne Social
          </h1>
          <div className="text-xs text-neutral-400 font-mono tracking-widest uppercase mt-4">
            AI \ SOCIAL \ GROUPS \ CHAT \ REALTIME
          </div>
        </div>

        <div className="w-full lg:w-1/2 pl-0 lg:pl-8 flex flex-col items-start">
          <p className="text-base sm:text-lg text-neutral-300 opacity-90 mb-8 max-w-md leading-relaxed">
            Connect with friends, share stories, create groups, and experience next-gen interactive conversations.
          </p>

          <div className="flex pointer-events-auto flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="border border-white/80 text-white font-semibold py-3 px-8 rounded-full transition duration-300 w-full sm:w-auto hover:bg-white hover:text-black cursor-pointer text-sm"
            >
              Log In
            </button>
            <button
              onClick={() => navigate(ROUTES.SIGNUP)}
              className="pointer-events-auto bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 hover:scale-105 flex items-center justify-center w-full sm:w-auto shadow-lg cursor-pointer text-sm gap-2"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export const HeroSection = () => {
  return (
    <div className="relative bg-black text-white h-screen w-screen overflow-hidden">
      <Navbar />

      <div className="relative h-screen w-full">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <HeroSplineBackground />
        </div>

        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            display: 'flex',
            justify: 'center',
            alignItems: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <HeroContent />
        </div>
      </div>
    </div>
  );
};
