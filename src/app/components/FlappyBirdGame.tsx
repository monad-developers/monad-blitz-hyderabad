"use client";

import { useEffect, useRef, useState } from "react";
import { initializeKaboom } from "./game/gameSetup";
import { useWeb3 } from "../contexts/Web3Context";
import WalletConnect from "./WalletConnect";
import { WEB3_CONFIG } from "../lib/web3/config";

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { wallet, sendTokens, isLoading: web3Loading, error: web3Error } = useWeb3();
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [redemptionStatus, setRedemptionStatus] = useState<{
    isRedeeming: boolean;
    success: boolean;
    txHash?: string;
    error?: string;
  }>({
    isRedeeming: false,
    success: false,
  });
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

    const cleanup = initializeKaboom(canvasRef.current, setGameState);

    return cleanup;
  }, []);

  const handleRedeemCoins = async () => {
    // Check if user has any coins
    if (gameState.coins < 1) {
      setRedemptionStatus({
        isRedeeming: false,
        success: false,
        error: `You need at least 1 coin to redeem!`,
      });
      return;
    }

    // Check if wallet is connected
    if (!wallet.isConnected) {
      setShowWalletConnect(true);
      return;
    }

    // Start redemption process
    setRedemptionStatus({
      isRedeeming: true,
      success: false,
    });

    try {
      // Send tokens to user's wallet
      const txHash = await sendTokens({
        recipientAddress: wallet.address!,
        amount: gameState.coins.toString(),
      });

      setRedemptionStatus({
        isRedeeming: false,
        success: true,
        txHash,
      });

      // Reset coins after successful redemption
      setGameState(prev => ({ ...prev, coins: 0 }));
    } catch (error: any) {
      setRedemptionStatus({
        isRedeeming: false,
        success: false,
        error: error.message || 'Failed to redeem coins. Please try again.',
      });
    }
  };

  const handlePlayAgain = () => {
    // Reset redemption status
    setRedemptionStatus({
      isRedeeming: false,
      success: false,
    });
    
    // Restart the game (this will trigger Kaboom to restart)
    if (canvasRef.current) {
      // The game restart logic is handled by Kaboom's scene management
      // We can trigger it by dispatching a space key event or calling the game's restart function
      const event = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black">
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

          {/* Right side - Score and Lives */}
          <div className="space-y-2">
            {/* Score */}
            <div className="bg-black/80 border-2 border-white rounded-lg px-4 py-2 font-mono">
              <div className="text-white font-bold text-xl" 
                   style={{ textShadow: "2px 2px 0px #000" }}>
                SCORE: {gameState.score}
              </div>
            </div>
            
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

        {/* Game Over Screen */}
        {gameState.gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-black/90 border-4 border-red-500 rounded-lg p-8 text-center font-mono max-w-md"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 20px rgba(255,0,0,0.3)" 
                 }}>
              <h2 className="text-4xl font-bold text-red-500 mb-4" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                GAME OVER
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="text-2xl text-white" 
                     style={{ textShadow: "1px 1px 0px #000" }}>
                  SCORE: <span className="text-yellow-400 font-bold">{gameState.score}</span>
                </div>
                <div className="text-xl text-white" 
                     style={{ textShadow: "1px 1px 0px #000" }}>
                  COINS: <span className="text-yellow-400 font-bold">{gameState.coins}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRedeemCoins}
                  disabled={redemptionStatus.isRedeeming || gameState.coins < 1}
                  className={`group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border-4 border-white rounded-lg transform hover:scale-105 transition-all duration-200 font-mono pointer-events-auto ${
                    redemptionStatus.isRedeeming 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : gameState.coins < 1
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-yellow-600 hover:bg-yellow-500'
                  }`}
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                    textShadow: "2px 2px 0px #000"
                  }}
                  onMouseDown={(e) => {
                    if (!redemptionStatus.isRedeeming && gameState.coins >= 1) {
                      e.currentTarget.style.transform = "scale(0.95) translateY(2px)";
                      e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 2px 0 #333";
                    }
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 4px 0 #333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 4px 0 #333";
                  }}
                >
                  {redemptionStatus.isRedeeming ? 'REDEEMING...' : 'REDEEM COINS'}
                </button>
                
                <button
                  onClick={handlePlayAgain}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-green-600 border-4 border-white rounded-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-200 font-mono pointer-events-auto"
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                    textShadow: "2px 2px 0px #000"
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.95) translateY(2px)";
                    e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 2px 0 #333";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 4px 0 #333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 4px 0 #333";
                  }}
                >
                  PLAY AGAIN
                </button>
              </div>

              {/* Redemption Status */}
              {redemptionStatus.success && (
                <div className="mt-4 bg-green-500/20 border-2 border-green-400 rounded-lg p-4">
                  <div className="text-green-400 font-bold text-center mb-2" style={{ textShadow: "1px 1px 0px #000" }}>
                    ✅ MON SENT SUCCESSFULLY!
                  </div>
                  {redemptionStatus.txHash && (
                    <div className="text-xs text-green-300 text-center">
                      <a 
                        href={`${WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK].blockExplorer}/tx/${redemptionStatus.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-green-200"
                      >
                        View Transaction
                      </a>
                    </div>
                  )}
                </div>
              )}

              {redemptionStatus.error && (
                <div className="mt-4 bg-red-500/20 border-2 border-red-400 rounded-lg p-4">
                  <div className="text-red-400 font-bold text-center mb-2" style={{ textShadow: "1px 1px 0px #000" }}>
                    ❌ REDEMPTION FAILED
                  </div>
                  <div className="text-xs text-red-300 text-center">
                    {redemptionStatus.error}
                  </div>
                </div>
              )}

              {/* Wallet Status */}
              {wallet.isConnected && (
                <div className="mt-4 bg-blue-500/20 border-2 border-blue-400 rounded-lg p-3">
                  <div className="text-blue-400 font-bold text-center text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                    💳 WALLET CONNECTED
                  </div>
                  <div className="text-xs text-blue-300 text-center">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </div>
                </div>
              )}

              {/* Redemption Requirements */}
              {gameState.coins < 1 && (
                <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3">
                  <div className="text-yellow-400 font-bold text-center text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                    ⚠️ COLLECT COINS TO REDEEM
                  </div>
                  <div className="text-xs text-yellow-300 text-center">
                    Play the game to collect coins and redeem for MON tokens!
                  </div>
                </div>
              )}
              
              <div className="text-xs text-white/70 mt-4 bg-black/50 px-4 py-2 rounded border border-white/30"
                   style={{ textShadow: "1px 1px 0px #000" }}>
                PRESS SPACE OR CLICK PLAY AGAIN TO RESTART
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

      {/* Wallet Connect Modal */}
      {showWalletConnect && (
        <WalletConnect onClose={() => setShowWalletConnect(false)} />
      )}
    </div>
  );
} 