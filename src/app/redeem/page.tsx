"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWeb3 } from "../contexts/Web3Context";
import WalletConnect from "../components/WalletConnect";
import { WEB3_CONFIG } from "../lib/web3/config";

export default function RedeemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet, sendTokens, isLoading: web3Loading, error: web3Error } = useWeb3();
  
  // Get game data from URL params
  const coins = parseInt(searchParams.get('coins') || '0');
  
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

  // Redirect if no game data
  useEffect(() => {
    if (coins === 0) {
      router.push('/');
    }
  }, [coins, router]);

  const handleRedeemCoins = async () => {
    // Check if user has any coins
    if (coins < 1) {
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
        amount: coins.toString(),
      });

      setRedemptionStatus({
        isRedeeming: false,
        success: true,
        txHash,
      });
    } catch (error: any) {
      setRedemptionStatus({
        isRedeeming: false,
        success: false,
        error: error.message || 'Failed to redeem coins. Please try again.',
      });
    }
  };

  const handlePlayAgain = () => {
    router.push('/game');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const calculateMonAmount = () => {
    return (coins * WEB3_CONFIG.GAME_REWARDS.COINS_TO_MON_RATIO).toFixed(3);
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: "url('/sprites/background-night.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated"
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
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
      <div className="relative z-10 max-w-2xl mx-auto p-6">
        <div className="bg-black/90 border-4 border-yellow-500 rounded-lg p-8 text-center font-mono"
             style={{ 
               boxShadow: "0 0 0 4px #000, 0 0 30px rgba(255, 255, 0, 0.3)" 
             }}>
          
          {/* Header */}
          <h1 className="text-5xl font-bold text-yellow-400 mb-4" 
              style={{ textShadow: "3px 3px 0px #000" }}>
            🎮 GAME COMPLETE!
          </h1>
          
          {/* Game Stats */}
          <div className="bg-black/50 border-2 border-white rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4" 
                style={{ textShadow: "2px 2px 0px #000" }}>
              📊 YOUR STATS
            </h2>
            
            <div className="flex justify-center">
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-2" 
                     style={{ textShadow: "2px 2px 0px #000" }}>
                  {coins}
                </div>
                <div className="text-white font-bold" style={{ textShadow: "1px 1px 0px #000" }}>
                  COINS EARNED
                </div>
              </div>
            </div>
          </div>

          {/* Redemption Section */}
          {coins > 0 && (
            <div className="bg-purple-500/20 border-4 border-purple-400 rounded-lg p-6 mb-6">
              <h2 className="text-3xl font-bold text-white mb-4" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                💰 REDEEM YOUR COINS
              </h2>
              
              <div className="text-lg text-white mb-4" 
                   style={{ textShadow: "1px 1px 0px #000" }}>
                Convert your {coins} coins into <span className="text-purple-400 font-bold">{calculateMonAmount()} MON</span> tokens!
              </div>
              
              <div className="text-sm text-gray-300 mb-6" 
                   style={{ textShadow: "1px 1px 0px #000" }}>
                Exchange Rate: 1 Coin = {WEB3_CONFIG.GAME_REWARDS.COINS_TO_MON_RATIO} MON
              </div>

              {/* Redemption Button */}
              <button
                onClick={handleRedeemCoins}
                disabled={redemptionStatus.isRedeeming || coins < 1}
                className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white border-4 border-white rounded-lg transform hover:scale-105 transition-all duration-200 font-mono mb-4 ${
                  redemptionStatus.isRedeeming 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : coins < 1
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
                style={{ 
                  boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                  textShadow: "2px 2px 0px #000"
                }}
              >
                {redemptionStatus.isRedeeming ? '🔄 REDEEMING...' : '💰 REDEEM FOR MON'}
              </button>

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
              {coins < 1 && (
                <div className="mt-4 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3">
                  <div className="text-yellow-400 font-bold text-center text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                    ⚠️ NO COINS TO REDEEM
                  </div>
                  <div className="text-xs text-yellow-300 text-center">
                    Play again to collect coins and redeem for MON tokens!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Coins Message */}
          {coins === 0 && (
            <div className="bg-gray-500/20 border-2 border-gray-400 rounded-lg p-6 mb-6">
              <div className="text-2xl text-gray-400 font-bold mb-2" style={{ textShadow: "1px 1px 0px #000" }}>
                😔 NO COINS EARNED
              </div>
              <div className="text-white" style={{ textShadow: "1px 1px 0px #000" }}>
                Better luck next time! Collect coins during gameplay to redeem for MON tokens.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePlayAgain}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-green-600 border-4 border-white rounded-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-200 font-mono"
              style={{ 
                boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                textShadow: "2px 2px 0px #000"
              }}
            >
              🎮 PLAY AGAIN
            </button>
            
            <button
              onClick={handleGoHome}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 border-4 border-white rounded-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-200 font-mono"
              style={{ 
                boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                textShadow: "2px 2px 0px #000"
              }}
            >
              🏠 HOME
            </button>
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