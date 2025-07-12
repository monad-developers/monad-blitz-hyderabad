"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletState, Web3ContextType, TokenTransactionParams } from '../lib/web3/types';
import { tokenService } from '../lib/web3/tokenService';
import { WEB3_CONFIG } from '../lib/web3/config';

const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  balance: '0',
  chainId: null,
  provider: null,
  signer: null,
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }));
          updateWalletBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = await provider.getBalance(address);
          const network = await provider.getNetwork();

          setWallet({
            isConnected: true,
            address,
            balance: ethers.formatEther(balance),
            chainId: Number(network.chainId),
            provider,
            signer,
          });
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      // Update wallet state
      setWallet({
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(network.chainId),
        provider,
        signer,
      });

      // Check if we're on the correct network
      const targetNetwork = WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK];
      if (Number(network.chainId) !== targetNetwork.chainId) {
        console.warn(`Connected to wrong network. Expected ${targetNetwork.name} (${targetNetwork.chainId}), got ${network.chainId}`);
      }

    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(initialWalletState);
    setError(null);
  };

  const updateWalletBalance = async (address: string) => {
    try {
      if (wallet.provider) {
        const balance = await wallet.provider.getBalance(address);
        setWallet(prev => ({ ...prev, balance: ethers.formatEther(balance) }));
      }
    } catch (err) {
      console.error('Error updating wallet balance:', err);
    }
  };

  const sendTokens = async (params: TokenTransactionParams): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!wallet.isConnected || !wallet.address) {
        throw new Error('Wallet not connected');
      }

      // Use the token service to send tokens from the game's wallet to the user's wallet
      const txHash = await tokenService.redeemGameCoins({
        coins: parseFloat(params.amount),
        userAddress: wallet.address,
      });

      // Update wallet balance after transaction
      await updateWalletBalance(wallet.address);

      return txHash;
    } catch (err: any) {
      console.error('Error sending tokens:', err);
      setError(err.message || 'Failed to send tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: Web3ContextType = {
    wallet,
    connectWallet,
    disconnectWallet,
    sendTokens,
    isLoading,
    error,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
} 