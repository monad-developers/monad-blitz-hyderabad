"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [animationFrame, setAnimationFrame] = useState(0);

  // Animate the floating elements
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    router.push("/game");
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/sprites/background-day.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Ground/Base */}
      <div 
        className="absolute bottom-0 left-0 w-full h-24 bg-repeat-x"
        style={{
          backgroundImage: "url('/sprites/base.png')",
          backgroundSize: "auto 100%",
          imageRendering: "pixelated"
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Hero Section with Retro Style */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 font-mono tracking-wider" 
                style={{ 
                  textShadow: "4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000",
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.8))"
                }}>
              DRIPPY BIRD
            </h1>
            
            {/* Animated Monad Cat */}
            <div className="flex justify-center mb-6">
              <img 
                src="/sprites/monad-cat.png" 
                alt="Monad Cat"
                className="w-24 h-24 object-contain"
                style={{
                  imageRendering: "pixelated",
                  transform: `translateY(${Math.sin(animationFrame * 0.2) * 8}px)`,
                  filter: "drop-shadow(2px 2px 0px rgba(0,0,0,0.5))"
                }}
              />
            </div>
            
            <div className="text-2xl md:text-3xl text-yellow-300 mb-6 font-mono font-bold"
                 style={{ textShadow: "2px 2px 0px #000" }}>
              COLLECT MONAD TOKENS!
            </div>
          </div>

          {/* Game Description Box - Retro Style */}
          <div className="bg-black/70 border-4 border-white rounded-lg p-8 mb-8 font-mono"
               style={{ 
                 boxShadow: "0 0 0 4px #000, 0 0 20px rgba(255,255,255,0.3)",
                 backdropFilter: "blur(2px)"
               }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-mono"
                style={{ textShadow: "2px 2px 0px #000" }}>
              READY FOR ADVENTURE?
            </h2>
            
            <div className="text-lg md:text-xl text-white space-y-4 mb-8 font-mono">
              <p style={{ textShadow: "1px 1px 0px #000" }}>
                Navigate through pipes while collecting precious <strong className="text-yellow-400">MONAD TOKENS</strong>!
              </p>
              <p style={{ textShadow: "1px 1px 0px #000" }}>
                Grab power-ups to boost your abilities and survive longer!
              </p>
              <p style={{ textShadow: "1px 1px 0px #000" }}>
                Experience the ultimate retro arcade challenge!
              </p>
            </div>

            {/* Power-ups Preview - Retro Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Monad Token */}
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4 font-mono">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/sprites/Monad Logo - Default - Logo Mark.png" 
                    alt="Monad Token"
                    className="w-12 h-12 object-contain"
                    style={{
                      imageRendering: "pixelated",
                      transform: `rotate(${animationFrame * 3}deg)`,
                      filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.5))"
                    }}
                  />
                </div>
                <div className="text-white font-bold text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  MONAD TOKENS
                </div>
                <div className="text-xs text-yellow-200" style={{ textShadow: "1px 1px 0px #000" }}>
                  Collect for points!
                </div>
              </div>

              {/* Mushroom Power-up */}
              <div className="bg-pink-500/20 border-2 border-pink-400 rounded-lg p-4 font-mono">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/sprites/Mushroom from KAPLAY Wiki.png" 
                    alt="Mushroom Power-up"
                    className="w-12 h-12 object-contain"
                    style={{
                      imageRendering: "pixelated",
                      transform: `scale(${1 + Math.sin(animationFrame * 0.3) * 0.1})`,
                      filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.5))"
                    }}
                  />
                </div>
                <div className="text-white font-bold text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  DOUBLE POINTS
                </div>
                <div className="text-xs text-pink-200" style={{ textShadow: "1px 1px 0px #000" }}>
                  2x tokens for 3 seconds!
                </div>
              </div>

              {/* Ghostiny Power-up */}
              <div className="bg-green-500/20 border-2 border-green-400 rounded-lg p-4 font-mono">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/sprites/Ghostiny from KAPLAY Crew Wiki.png" 
                    alt="Ghostiny Power-up"
                    className="w-12 h-12 object-contain"
                    style={{
                      imageRendering: "pixelated",
                      opacity: 0.5 + Math.sin(animationFrame * 0.4) * 0.3,
                      filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.5))"
                    }}
                  />
                </div>
                <div className="text-white font-bold text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  GHOST MODE
                </div>
                <div className="text-xs text-green-200" style={{ textShadow: "1px 1px 0px #000" }}>
                  Pass through pipes!
                </div>
              </div>
            </div>
          </div>

          {/* Start Game Button - Retro Style */}
          <button
            onClick={handleStartGame}
            className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-green-600 border-4 border-white rounded-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-200 font-mono"
            style={{ 
              boxShadow: "0 0 0 4px #000, 0 6px 0 #333",
              textShadow: "2px 2px 0px #000"
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95) translateY(2px)";
              e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 2px 0 #333";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 6px 0 #333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 6px 0 #333";
            }}
          >
            START GAME
          </button>

          {/* Retro Instructions */}
          <div className="mt-8 text-white font-mono">
            <p className="text-sm bg-black/50 inline-block px-4 py-2 rounded border border-white"
               style={{ textShadow: "1px 1px 0px #000" }}>
              PRESS SPACE OR CLICK TO JUMP • COLLECT TOKENS • AVOID PIPES
            </p>
          </div>
        </div>
      </div>

      {/* Floating animated elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating coins */}
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src="/sprites/Monad Logo - Default - Logo Mark.png"
            alt="Floating coin"
            className="absolute w-8 h-8 object-contain opacity-30"
            style={{
              imageRendering: "pixelated",
              left: `${20 + i * 15}%`,
              top: `${30 + Math.sin(animationFrame * 0.1 + i) * 10}%`,
              transform: `rotate(${animationFrame * 2 + i * 30}deg)`,
              filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.3))"
            }}
          />
        ))}
      </div>
    </div>
  );
} 