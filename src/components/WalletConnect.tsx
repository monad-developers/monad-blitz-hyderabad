
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WalletConnectProps {
  onConnect: (address: string) => void;
  isConnected: boolean;
  address?: string;
}

export const WalletConnect = ({ onConnect, isConnected, address }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        onConnect(accounts[0]);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <Card className="portfolio-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-400/10">
            <Zap className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
            <p className="font-mono text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="portfolio-card text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-primary/10">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground mb-4">
            Connect MetaMask to analyze your portfolio
          </p>
        </div>
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>
      </div>
    </Card>
  );
};
