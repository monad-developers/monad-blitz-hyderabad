"use client";

import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { WEB3_CONFIG } from '../lib/web3/config';

interface WalletConnectProps {
  onClose?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onClose }) => {
  const { wallet, connectWallet, disconnectWallet, isLoading, error } = useWeb3();
  const [showDetails, setShowDetails] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black/90 border-4 border-white rounded-lg p-6 max-w-md w-full mx-4 font-mono"
           style={{ 
             boxShadow: "0 0 0 4px #000, 0 0 20px rgba(255,255,255,0.3)" 
           }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white" 
              style={{ textShadow: "2px 2px 0px #000" }}>
            WALLET
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-xl font-bold"
              style={{ textShadow: "1px 1px 0px #000" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-400 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
              {error}
            </p>
          </div>
        )}

        {/* Wallet Status */}
        {!wallet.isConnected ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-white mb-2" style={{ textShadow: "1px 1px 0px #000" }}>
                Connect your wallet to redeem tokens
              </div>
              <div className="text-gray-400 text-sm">
                Make sure you have MetaMask installed
              </div>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-white transition-colors"
              style={{ 
                boxShadow: "0 0 0 2px #000, 0 4px 0 #333",
                textShadow: "1px 1px 0px #000"
              }}
            >
              {isLoading ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          </div>
        ) : (
          <div>
            {/* Connected Status */}
            <div className="bg-green-500/20 border-2 border-green-400 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-bold" style={{ textShadow: "1px 1px 0px #000" }}>
                  CONNECTED
                </span>
              </div>
              
              <div className="text-white text-sm space-y-1">
                <div className="flex justify-between items-center">
                  <span>Address:</span>
                  <button
                    onClick={() => copyToClipboard(wallet.address!)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Click to copy"
                  >
                    {formatAddress(wallet.address!)}
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Balance:</span>
                  <span className="text-yellow-400">{parseFloat(wallet.balance).toFixed(4)} ETH</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Network:</span>
                  <span className="text-purple-400">{getNetworkName()}</span>
                </div>
              </div>
            </div>

            {/* Network Warning */}
            {wallet.chainId !== WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK].chainId && (
              <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm" style={{ textShadow: "1px 1px 0px #000" }}>
                  ⚠️ You're connected to the wrong network. Please switch to {WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK].name}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-white"
                style={{ 
                  boxShadow: "0 0 0 2px #000, 0 2px 0 #333",
                  textShadow: "1px 1px 0px #000"
                }}
              >
                {showDetails ? 'HIDE' : 'DETAILS'}
              </button>
              
              <button
                onClick={handleDisconnect}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-white"
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
                <h3 className="text-white font-bold mb-2" style={{ textShadow: "1px 1px 0px #000" }}>
                  Wallet Details
                </h3>
                <div className="text-xs text-gray-300 space-y-1">
                  <div>
                    <span className="text-gray-400">Full Address:</span>
                    <div className="break-all text-blue-400 mt-1">{wallet.address}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Chain ID:</span>
                    <span className="ml-2">{wallet.chainId}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="ml-2">{getNetworkName()}</span>
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