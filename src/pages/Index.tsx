import { useState, useEffect } from "react";
import { WalletConnect } from "@/components/WalletConnect";
import { WalletSearch } from "@/components/WalletSearch";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TokenList } from "@/components/TokenList";
import { RiskAnalysis } from "@/components/RiskAnalysis";
import { RecommendationEngine } from "@/components/RecommendationEngine";
import { blockchainService, TokenBalance } from "@/services/blockchain";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [dayChange, setDayChange] = useState(0);
  const { toast } = useToast();

  const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;

  const fetchTokenBalances = async (address: string) => {
    setIsLoading(true);
    try {
      const tokenBalances = await blockchainService.getTokenBalances(address);
      setTokens(tokenBalances);
      setCurrentAddress(address);

      const total = tokenBalances.reduce(
        (sum, token) => sum + token.usdValue,
        0
      );
      setTotalValue(total);
      setDayChange(total * 0.02); // Mock 2% daily change

      toast({
        title: "Portfolio Loaded",
        description: `Found ${tokenBalances.length} tokens in wallet`,
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        title: "Error",
        description: "Failed to fetch token balances. Please try again.",
        variant: "destructive",
      });
      setTokens([]);
      setTotalValue(0);
      setDayChange(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
    fetchTokenBalances(address);
  };

  const handleSearch = (address: string) => {
    fetchTokenBalances(address);
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchTokenBalances(walletAddress);
    }
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Smart Portfolio Analyzer</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered crypto portfolio analysis with risk assessment and trading
          recommendations
        </p>
      </div>

      <div className="space-y-8">
        {!isConnected && (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <WalletConnect
                onConnect={handleConnect}
                isConnected={isConnected}
                address={walletAddress}
              />
            </div>
          </div>
        )}

        {isConnected && (
          <WalletConnect
            onConnect={handleConnect}
            isConnected={isConnected}
            address={walletAddress}
          />
        )}

        <WalletSearch onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span className="text-lg">Loading portfolio data...</span>
          </div>
        )}

        {!isLoading && currentAddress && tokens.length > 0 && (
          <>
            <PortfolioOverview
              totalValue={totalValue}
              dayChange={dayChange}
              dayChangePercent={dayChangePercent}
            />

            <div className="space-y-8">
              <TokenList tokens={tokens} />
              <RiskAnalysis tokens={tokens} />
              <RecommendationEngine tokens={tokens} />
            </div>
          </>
        )}

        {!isLoading && currentAddress && tokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No tokens found in this wallet on Monad blockchain.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different wallet address or make sure the wallet has tokens
              on Monad testnet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
