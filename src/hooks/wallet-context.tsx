"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

type WalletContextType = {
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const ethereum = (window as any)?.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem("walletConnected", "true");
      } else {
        setAccount(null);
        localStorage.removeItem("walletConnected");
      }
    };

    ethereum.on("accountsChanged", handleAccountsChanged);

    // Check if already connected from previous session
    const isConnected = localStorage.getItem("walletConnected") === "true";
    if (isConnected) {
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);
    }

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []); // 👈 no dependency

  const connect = async () => {
    const ethereum = (window as any)?.ethereum;
    if (!ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem("walletConnected", "true");
        toast.success("Wallet connected");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet");
    }
  };

  const disconnect = () => {
    setAccount(null);
    localStorage.removeItem("walletConnected");
    toast("Wallet disconnected");
  };

  return (
    <WalletContext.Provider value={{ account, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside a WalletProvider");
  }
  return context;
};
