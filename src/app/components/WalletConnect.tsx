"use client";

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { WEB3_CONFIG } from '../lib/web3/config';

interface WalletConnectProps {
  onClose?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onClose }) => {
  const { wallet, connectWallet, disconnectWallet, isLoading, error } = useWeb3();
  const [showDetails, setShowDetails] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Utility functions for mobile detection (client-side only)
  const isMobile = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false;
    return window.ethereum && window.ethereum.isMetaMask;
  };

  // Client-side detection
  useEffect(() => {
    setIsMobileDevice(isMobile());
    setIsMetaMaskAvailable(isMetaMaskInstalled());
  }, []);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    if (onClose) onClose();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getNetworkName = () => {
    const networks = WEB3_CONFIG.NETWORKS;
    const network = Object.values(networks).find(net => net.chainId === wallet.chainId);
    return network?.name || 'Unknown Network';
  };

  const getConnectButtonText = () => {
    if (isLoading) return 'CONNECTING...';
    if (isMobileDevice && !isMetaMaskAvailable) {
      return 'OPEN METAMASK APP';
    }
    return 'CONNECT WALLET';
  };

  const getInstructionText = () => {
    if (isMobileDevice && !isMetaMaskAvailable) {
      return 'Tap to open MetaMask app or install it from your app store';
    }
    return 'Make sure you have MetaMask installed';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-black/90 border-2 sm:border-4 border-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 font-mono max-h-[90vh] overflow-y-auto"
           style={{ 
             boxShadow: "0 0 0 2px #000, 0 0 20px rgba(255,255,255,0.3)" 
           }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white" 
              style={{ textShadow: "2px 2px 0px #000" }}>
            WALLET
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-xl font-bold p-2 -m-2 touch-manipulation"
              style={{ textShadow: "1px 1px 0px #000" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-xs sm:text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
              {error}
            </p>
          </div>
        )}

        {/* Wallet Status */}
        {!wallet.isConnected ? (
          <div className="text-center">
            <div className="mb-4 sm:mb-6">
              <div className="text-white mb-2 text-sm sm:text-base" style={{ textShadow: "1px 1px 0px #000" }}>
                Connect your wallet to redeem tokens
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">
                {getInstructionText()}
              </div>
              {isMobileDevice && !isMetaMaskAvailable && (
                <div className="mt-2 text-yellow-400 text-xs sm:text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  📱 This will open MetaMask app or redirect to app store
                </div>
              )}
            </div>
            
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 sm:px-6 rounded-lg border-2 border-white transition-colors text-sm sm:text-base touch-manipulation"
              style={{ 
                boxShadow: "0 0 0 2px #000, 0 4px 0 #333",
                textShadow: "1px 1px 0px #000"
              }}
            >
              {getConnectButtonText()}
            </button>
          </div>
        ) : (
          <div>
            {/* Connected Status */}
            <div className="bg-green-500/20 border-2 border-green-400 rounded-lg p-3 sm:p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-bold text-sm sm:text-base" style={{ textShadow: "1px 1px 0px #000" }}>
                  CONNECTED
                </span>
              </div>
              
              <div className="text-white text-xs sm:text-sm space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-300">Address:</span>
                  <button
                    onClick={() => copyToClipboard(wallet.address!)}
                    className="text-blue-400 hover:text-blue-300 text-left sm:text-right break-all sm:break-normal touch-manipulation"
                    title="Click to copy"
                  >
                    <span className="sm:hidden">{wallet.address}</span>
                    <span className="hidden sm:inline">{formatAddress(wallet.address!)}</span>
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Balance:</span>
                  <span className="text-yellow-400">{parseFloat(wallet.balance).toFixed(4)} MON</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Network:</span>
                  <span className="text-purple-400 text-right">{getNetworkName()}</span>
                </div>
              </div>
            </div>

            {/* Network Warning */}
            {wallet.chainId !== WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK].chainId && (
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-xs sm:text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  ⚠️ You're connected to the wrong network. Please switch to {WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK].name}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 sm:px-4 rounded-lg border-2 border-white text-sm sm:text-base touch-manipulation"
                style={{ 
                  boxShadow: "0 0 0 2px #000, 0 2px 0 #333",
                  textShadow: "1px 1px 0px #000"
                }}
              >
                {showDetails ? 'HIDE' : 'DETAILS'}
              </button>
              
              <button
                onClick={handleDisconnect}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 sm:px-4 rounded-lg border-2 border-white text-sm sm:text-base touch-manipulation"
                style={{ 
                  boxShadow: "0 0 0 2px #000, 0 2px 0 #333",
                  textShadow: "1px 1px 0px #000"
                }}
              >
                DISCONNECT
              </button>
            </div>

            {/* Detailed Information */}
            {showDetails && (
              <div className="mt-4 bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                <h3 className="text-white font-bold mb-2 text-sm sm:text-base" style={{ textShadow: "1px 1px 0px #000" }}>
                  Wallet Details
                </h3>
                <div className="text-xs text-gray-300 space-y-2">
                  <div>
                    <span className="text-gray-400">Full Address:</span>
                    <div className="break-all text-blue-400 mt-1 text-xs">{wallet.address}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain ID:</span>
                    <span>{wallet.chainId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network:</span>
                    <span className="text-right">{getNetworkName()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect; 