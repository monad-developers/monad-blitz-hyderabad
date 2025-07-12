
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Zap } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  priceChange24h: number;
  riskScore: 'low' | 'medium' | 'high';
  recommendation: 'buy' | 'hold' | 'sell';
  marketCap: number;
}

interface TokenListProps {
  tokens: Token[];
}

export const TokenList = ({ tokens }: TokenListProps) => {
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <Shield className="h-4 w-4" />;
      case 'medium': return <Zap className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'buy': return 'bg-green-400/10 text-green-400';
      case 'hold': return 'bg-yellow-400/10 text-yellow-400';
      case 'sell': return 'bg-red-400/10 text-red-400';
      default: return 'bg-gray-400/10 text-gray-400';
    }
  };

  return (
    <Card className="portfolio-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Your Tokens</h2>
        <Badge variant="secondary">{tokens.length} tokens</Badge>
      </div>
      
      <div className="space-y-4">
        {tokens.map((token, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {token.symbol.slice(0, 2).toUpperCase()}
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{token.symbol}</h3>
                  <Badge className={`risk-${token.riskScore} px-2 py-1 text-xs`}>
                    {getRiskIcon(token.riskScore)}
                    <span className="ml-1 capitalize">{token.riskScore}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{token.name}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">${token.usdValue.toLocaleString()}</p>
                <div className={`flex items-center ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.priceChange24h >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm ml-1">
                    {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {token.balance.toLocaleString()} {token.symbol}
                </p>
                <Badge className={getRecommendationColor(token.recommendation)}>
                  {token.recommendation.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
