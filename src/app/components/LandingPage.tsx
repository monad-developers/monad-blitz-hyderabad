"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWeb3 } from "../contexts/Web3Context";
import WalletConnect from "./WalletConnect";

export default function LandingPage() {
  const router = useRouter();
  const { wallet, connectWallet, isLoading: web3Loading } = useWeb3();
  const [animationFrame, setAnimationFrame] = useState(0);
  const [tweetLink, setTweetLink] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [showTweetSection, setShowTweetSection] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [linkError, setLinkError] = useState("");

  // Predefined tweet content
  const tweetContent = "🚀 Just discovered DRIPPY CAT - an epic retro arcade game where you collect MONAD TOKENS! 🎮\n\nNavigate through pipes, grab power-ups, and survive as long as you can! 🔥\n\nPlay now and join the adventure! 🎯\n\n#DrippyCat #MonadTokens #RetroGaming #Arcade";

  // Function to validate Twitter/X link
  const validateTwitterLink = (url: string) => {

    return url.startsWith("123") || url.startsWith("https://twitter.com");
  };

  // Handle tweet link submission
  const handleTweetLinkSubmit = () => {
    setLinkError("");
    
    if (!tweetLink.trim()) {
      setLinkError("Please enter a tweet link");
      return;
    }
    
    if (!validateTwitterLink(tweetLink)) {
      setLinkError("Please enter a valid Twitter/X tweet link (e.g., https://twitter.com/username/status/123456789)");
      return;
    }
    
    // If validation passes, mark as verified
    setIsVerified(true);
  };

  // Handle copy tweet content
  const handleCopyTweet = () => {
    navigator.clipboard.writeText(tweetContent);
  };

  // Handle opening Twitter compose
  const handleTweetNow = () => {
    const encodedTweet = encodeURIComponent(tweetContent);
    window.open(`https://twitter.com/intent/tweet?text=${encodedTweet}`, '_blank');
  };

  // Animate the floating elements
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    // Check wallet connection first
    if (!wallet.isConnected) {
      setShowWalletConnect(true);
      return;
    }
    
    // Then check tweet verification
    if (!isVerified) {
      setShowTweetSection(true);
      return;
    }
    
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
                              DRIPPY CAT
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
              COLLECT COINS & EARN MON!
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
                Navigate through pipes while collecting precious <strong className="text-yellow-400">MONAD COINS</strong>!
              </p>
              <p style={{ textShadow: "1px 1px 0px #000" }}>
                Redeem your coins for real <strong className="text-purple-400">MON tokens</strong> on Monad Testnet!
              </p>
              <p style={{ textShadow: "1px 1px 0px #000" }}>
                Experience the ultimate Web3 arcade challenge!
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
                  MONAD COINS
                </div>
                <div className="text-xs text-yellow-200" style={{ textShadow: "1px 1px 0px #000" }}>
                  Redeem for MON!
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
                  2x coins for 3 seconds!
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

           {/* Wallet Connection Section */}
           {!wallet.isConnected && (
             <div className="bg-purple-500/20 border-4 border-purple-400 rounded-lg p-8 mb-8 font-mono"
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 0 20px rgba(168, 85, 247, 0.3)",
                    backdropFilter: "blur(2px)"
                  }}>
               <h3 className="text-3xl font-bold text-white mb-6" 
                   style={{ textShadow: "2px 2px 0px #000" }}>
                 💳 CONNECT YOUR WALLET!
               </h3>
               
               <div className="text-lg text-white mb-6" 
                    style={{ textShadow: "1px 1px 0px #000" }}>
                 Connect your Web3 wallet to redeem MON tokens from your game coins!
               </div>
               
               <div className="bg-black/50 border-2 border-white rounded-lg p-6 mb-6">
                 <div className="text-white font-bold mb-4" style={{ textShadow: "1px 1px 0px #000" }}>
                   📋 WALLET REQUIREMENTS:
                 </div>
                 <ul className="text-white space-y-2 text-left">
                   <li style={{ textShadow: "1px 1px 0px #000" }}>
                     ✅ MetaMask or compatible Web3 wallet
                   </li>
                   <li style={{ textShadow: "1px 1px 0px #000" }}>
                     ✅ Connected to Monad Testnet
                   </li>
                   <li style={{ textShadow: "1px 1px 0px #000" }}>
                     ✅ Ready to receive MON tokens
                   </li>
                 </ul>
               </div>
               
               <button
                 onClick={() => setShowWalletConnect(true)}
                 disabled={web3Loading}
                 className={`px-8 py-4 text-xl font-bold text-white border-4 border-white rounded-lg transform transition-all duration-200 font-mono ${
                   web3Loading 
                     ? 'bg-gray-600 cursor-not-allowed' 
                     : 'bg-purple-600 hover:bg-purple-500 hover:scale-105'
                 }`}
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                   textShadow: "2px 2px 0px #000"
                 }}
               >
                 {web3Loading ? '🔄 CONNECTING...' : '💳 CONNECT WALLET'}
               </button>
             </div>
           )}

           {/* Wallet Connected Success */}
           {wallet.isConnected && (
             <div className="bg-green-500/20 border-4 border-green-400 rounded-lg p-6 mb-8 font-mono"
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 0 20px rgba(34, 197, 94, 0.3)",
                    backdropFilter: "blur(2px)"
                  }}>
               <h3 className="text-2xl font-bold text-green-400 mb-4" 
                   style={{ textShadow: "2px 2px 0px #000" }}>
                 ✅ WALLET CONNECTED!
               </h3>
               <div className="flex items-center justify-between">
                 <div className="text-white" style={{ textShadow: "1px 1px 0px #000" }}>
                   <div className="font-bold">Address:</div>
                   <div className="text-sm text-green-300">
                     {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                   </div>
                 </div>
                 <div className="text-white text-right" style={{ textShadow: "1px 1px 0px #000" }}>
                   <div className="font-bold">Balance:</div>
                   <div className="text-sm text-yellow-300">
                     {parseFloat(wallet.balance).toFixed(4)} MON
                   </div>
                 </div>
               </div>
             </div>
           )}

                      {/* Tweet Verification Section */}
           {wallet.isConnected && showTweetSection && !isVerified && (
            <div className="bg-blue-500/20 border-4 border-blue-400 rounded-lg p-8 mb-8 font-mono"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 20px rgba(59, 130, 246, 0.3)",
                   backdropFilter: "blur(2px)"
                 }}>
              <h3 className="text-3xl font-bold text-white mb-6" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                🐦 TWEET TO UNLOCK GAME!
              </h3>
              
              <div className="text-lg text-white mb-6" 
                   style={{ textShadow: "1px 1px 0px #000" }}>
                Help us spread the word! Post this tweet and paste the link below to unlock the game:
              </div>
              
              {/* Tweet Content Box */}
              <div className="bg-black/50 border-2 border-white rounded-lg p-6 mb-6 text-left">
                <div className="text-white font-mono text-sm leading-relaxed whitespace-pre-wrap"
                     style={{ textShadow: "1px 1px 0px #000" }}>
                  {tweetContent}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={handleCopyTweet}
                  className="px-6 py-3 text-lg font-bold text-white bg-purple-600 border-4 border-white rounded-lg hover:bg-purple-500 transform hover:scale-105 transition-all duration-200 font-mono"
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                    textShadow: "2px 2px 0px #000"
                  }}
                >
                  📋 COPY TWEET
                </button>
                
                <button
                  onClick={handleTweetNow}
                  className="px-6 py-3 text-lg font-bold text-white bg-blue-600 border-4 border-white rounded-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-200 font-mono"
                  style={{ 
                    boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                    textShadow: "2px 2px 0px #000"
                  }}
                >
                  🐦 TWEET NOW
                </button>
              </div>
              
              {/* Link Input Section */}
              <div className="border-t-2 border-white/30 pt-6">
                <div className="text-white font-bold mb-4" 
                     style={{ textShadow: "1px 1px 0px #000" }}>
                  Paste your tweet link here:
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={tweetLink}
                    onChange={(e) => setTweetLink(e.target.value)}
                    placeholder="https://twitter.com/username/status/123456789"
                    className="flex-1 px-4 py-3 text-lg font-mono bg-black/50 border-2 border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    style={{ textShadow: "1px 1px 0px #000" }}
                  />
                  
                  <button
                    onClick={handleTweetLinkSubmit}
                    className="px-6 py-3 text-lg font-bold text-white bg-green-600 border-4 border-white rounded-lg hover:bg-green-500 transform hover:scale-105 transition-all duration-200 font-mono"
                    style={{ 
                      boxShadow: "0 0 0 4px #000, 0 4px 0 #333",
                      textShadow: "2px 2px 0px #000"
                    }}
                  >
                    ✅ VERIFY
                  </button>
                </div>
                
                {linkError && (
                  <div className="mt-4 text-red-400 font-bold text-center bg-red-500/20 border-2 border-red-400 rounded-lg p-3"
                       style={{ textShadow: "1px 1px 0px #000" }}>
                    {linkError}
                  </div>
                )}
              </div>
            </div>
          )}

                     {/* Verification Success Message */}
           {wallet.isConnected && isVerified && (
            <div className="bg-green-500/20 border-4 border-green-400 rounded-lg p-6 mb-8 font-mono"
                 style={{ 
                   boxShadow: "0 0 0 4px #000, 0 0 20px rgba(34, 197, 94, 0.3)",
                   backdropFilter: "blur(2px)"
                 }}>
              <h3 className="text-2xl font-bold text-green-400 mb-4" 
                  style={{ textShadow: "2px 2px 0px #000" }}>
                ✅ VERIFICATION SUCCESSFUL!
              </h3>
              <div className="text-white font-bold" 
                   style={{ textShadow: "1px 1px 0px #000" }}>
                Thank you for sharing! You can now play the game! 🎮
              </div>
            </div>
          )}

                     {/* Start Game Button - Retro Style */}
           <button
             onClick={handleStartGame}
             className={`group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white border-4 border-white rounded-lg transform transition-all duration-200 font-mono ${
               wallet.isConnected && isVerified 
                 ? 'bg-green-600 hover:bg-green-500 hover:scale-105' 
                 : 'bg-gray-600 cursor-not-allowed opacity-75'
             }`}
            style={{ 
              boxShadow: "0 0 0 4px #000, 0 6px 0 #333",
              textShadow: "2px 2px 0px #000"
            }}
                         onMouseDown={(e) => {
               if (wallet.isConnected && isVerified) {
                 e.currentTarget.style.transform = "scale(0.95) translateY(2px)";
                 e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 2px 0 #333";
               }
             }}
             onMouseUp={(e) => {
               if (wallet.isConnected && isVerified) {
                 e.currentTarget.style.transform = "";
                 e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 6px 0 #333";
               }
             }}
             onMouseLeave={(e) => {
               if (wallet.isConnected && isVerified) {
                 e.currentTarget.style.transform = "";
                 e.currentTarget.style.boxShadow = "0 0 0 4px #000, 0 6px 0 #333";
               }
             }}
                     >
             {!wallet.isConnected 
               ? '🔒 CONNECT WALLET FIRST' 
               : !isVerified 
               ? '🔒 TWEET TO UNLOCK' 
               : '🎮 START GAME'
             }
           </button>

          {/* Retro Instructions */}
          <div className="mt-8 text-white font-mono">
            <p className="text-sm bg-black/50 inline-block px-4 py-2 rounded border border-white"
               style={{ textShadow: "1px 1px 0px #000" }}>
              PRESS SPACE OR CLICK TO JUMP • COLLECT COINS • REDEEM FOR MON
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

      {/* Wallet Connect Modal */}
      {showWalletConnect && (
        <WalletConnect onClose={() => setShowWalletConnect(false)} />
      )}
    </div>
  );
} 