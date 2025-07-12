"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initializeKaboom } from "./game/gameSetup";

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [gameState, setGameState] = useState({
    score: 0,
    coins: 0,
    lives: 3,
    doublePoints: false,
    doublePointsTimer: 0,
    ghostMode: false,
    ghostModeTimer: 0,
    gameOver: false,
    gameStarted: false,
    showReadyUI: true,
    showLifeLostMessage: false
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    let cleanup: (() => void) | undefined;

    // Add a small delay to ensure the canvas is fully rendered
    const initTimer = setTimeout(() => {
      if (canvasRef.current) {
        cleanup = initializeKaboom(canvasRef.current, setGameState);
        setIsGameLoaded(true);
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  // Auto-redirect to redemption page when game is over
  useEffect(() => {
    if (gameState.gameOver && gameState.lives === 0) {
      // Small delay to let the user see the game over state briefly
      const redirectTimer = setTimeout(() => {
        const searchParams = new URLSearchParams({
          coins: gameState.coins.toString(),
        });
        router.push(`/redeem?${searchParams.toString()}`);
      }, 2000); // 2 second delay

      return () => clearTimeout(redirectTimer);
    }
  }, [gameState.gameOver, gameState.lives, gameState.coins, router]);



  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
      {/* Loading Screen */}
      {!isGameLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
            <div className="text-white text-xl font-mono" style={{ textShadow: "2px 2px 0px #000" }}>
              LOADING GAME...
            </div>
          </div>
        </div>
      )}
      
      {/* Game Canvas */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
      
      {/* Retro UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Left side - Coins and Power-ups */}
          <div className="space-y-2">
            {/* Coins Counter */}
            <div className="bg-black/80 border-2 border-yellow-400 rounded-lg px-4 py-2 font-mono">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                  $
                </div>
                <span className="text-yellow-400 font-bold text-lg" 
                      style={{ textShadow: "1px 1px 0px #000" }}>
                  {gameState.coins}
                </span>
              </div>
            </div>

            {/* Power-up Indicators */}
            {gameState.doublePoints && (
              <div className="bg-pink-500/20 border-2 border-pink-400 rounded-lg px-4 py-2 font-mono animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                    2x
                  </div>
                  <span className="text-pink-400 font-bold text-sm" 
                        style={{ textShadow: "1px 1px 0px #000" }}>
                    {Math.ceil(gameState.doublePointsTimer)}s
                  </span>
                </div>
              </div>
            )}

            {gameState.ghostMode && (
              <div className="bg-green-500/20 border-2 border-green-400 rounded-lg px-4 py-2 font-mono animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black font-bold text-xs">
                    👻
                  </div>
                  <span className="text-green-400 font-bold text-sm" 
                        style={{ textShadow: "1px 1px 0px #000" }}>
                    GHOST: {Math.ceil(gameState.ghostModeTimer)}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Lives only */}
          <div className="space-y-2">
            {/* Lives */}
            <div className="bg-black/80 border-2 border-red-400 rounded-lg px-4 py-2 font-mono">
              <div className="flex items-center space-x-2">
                <span className="text-red-400 font-bold text-lg" 
                      style={{ textShadow: "1px 1px 0px #000" }}>
                  LIVES:
                </span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full ${
                        i < gameState.lives ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                      style={{
                        boxShadow: i < gameState.lives ? '0 0 4px rgba(239, 68, 68, 0.5)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Life Lost Message */}
        {gameState.showLifeLostMessage && gameState.ghostMode && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/50">
            <div className="bg-red-500/20 border-4 border-red-400 rounded-lg p-12 text-center font-mono animate-pulse"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 30px rgba(255,0,0,0.5)" 
                 }}>
              <h2 className="text-4xl font-bold text-red-400 mb-6" 
                  style={{ textShadow: "3px 3px 0px #000" }}>
                LIFE LOST!
              </h2>
              
              {/* Large Life Counter in Center */}
              <div className="mb-6">
                <div className="text-6xl font-bold text-white mb-2"
                     style={{ textShadow: "3px 3px 0px #000" }}>
                  {gameState.lives}
                </div>
                <div className="text-2xl text-red-400 font-bold"
                     style={{ textShadow: "2px 2px 0px #000" }}>
                  LIVES LEFT
                </div>
              </div>
              
              <p className="text-green-400 font-bold text-xl mb-4" 
                 style={{ textShadow: "2px 2px 0px #000" }}>
                👻 GHOST MODE ACTIVATED
              </p>
              <div className="text-lg text-yellow-400 bg-black/50 px-6 py-3 rounded border border-yellow-400 animate-pulse"
                   style={{ textShadow: "1px 1px 0px #000" }}>
                GAME PAUSED - RESUMING IN 3 SECONDS...
              </div>
            </div>
          </div>
        )}

        {/* Game Start Instructions */}
        {gameState.showReadyUI && !gameState.gameStarted && !gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/80 border-4 border-white rounded-lg p-8 text-center font-mono max-w-md"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 20px rgba(255,255,255,0.3)" 
                 }}>
              <h2 className="text-3xl font-bold text-white mb-4" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                READY?
              </h2>
              <p className="text-white mb-6" 
                 style={{ textShadow: "1px 1px 0px #000" }}>
                Collect <span className="text-yellow-400 font-bold">MONAD COINS</span> and redeem for MON!
              </p>
              <div className="text-sm text-white bg-black/50 px-4 py-2 rounded border border-white"
                   style={{ textShadow: "1px 1px 0px #000" }}>
                PRESS SPACE OR CLICK TO START
              </div>
            </div>
          </div>
        )}

        {/* Game Over Transition Screen */}
        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-black/90 border-4 border-red-500 rounded-lg p-8 text-center font-mono max-w-md"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 20px rgba(255,0,0,0.3)" 
                 }}>
              <h2 className="text-4xl font-bold text-red-500 mb-4" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                GAME OVER
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="text-xl text-white" 
                     style={{ textShadow: "1px 1px 0px #000" }}>
                  COINS: <span className="text-yellow-400 font-bold">{gameState.coins}</span>
                </div>
              </div>

              {/* Loading indicator for redirect */}
              <div className="flex flex-col items-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <div className="text-white font-bold" style={{ textShadow: "1px 1px 0px #000" }}>
                  REDIRECTING TO REDEMPTION...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="text-white font-mono text-sm bg-black/50 px-4 py-2 rounded border border-white"
               style={{ textShadow: "1px 1px 0px #000" }}>
            SPACE/CLICK TO JUMP • COLLECT COINS • REDEEM FOR MON
          </div>
        </div>
      </div>

    </div>
  );
} 