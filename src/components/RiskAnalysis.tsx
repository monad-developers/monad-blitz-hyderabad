import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, TrendingUp, Users } from "lucide-react";

interface Token {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  priceChange24h: number;
  riskScore: "low" | "medium" | "high";
  recommendation: "buy" | "hold" | "sell";
  marketCap: number;
}

interface RiskAnalysisProps {
  tokens?: Token[];
}

interface RiskMetric {
  name: string;
  score: number;
  description: string;
  icon: React.ReactNode;
}

export const RiskAnalysis = ({ tokens = [] }: RiskAnalysisProps) => {
  const calculateDiversification = (): number => {
    if (tokens.length === 0) return 0;
    if (tokens.length === 1) return 30;
    if (tokens.length >= 5) return 85;
    return 50 + (tokens.length - 2) * 10;
  };

  const calculateVolatilityRisk = (): number => {
    if (tokens.length === 0) return 0;
    const avgPriceChange =
      tokens.reduce((sum, token) => sum + Math.abs(token.priceChange24h), 0) /
      tokens.length;
    return Math.max(10, Math.min(90, 100 - avgPriceChange * 2));
  };

  const calculateLiquidityRisk = (): number => {
    if (tokens.length === 0) return 0;
    const hasStablecoins = tokens.some(
      (token) =>
        token.symbol === "USDC" ||
        token.symbol === "USDT" ||
        token.symbol === "DAI"
    );
    const hasMainTokens = tokens.some(
      (token) =>
        token.symbol === "MON" ||
        token.symbol === "ETH" ||
        token.symbol === "BTC"
    );

    if (hasStablecoins && hasMainTokens) return 85;
    if (hasMainTokens) return 70;
    return 45;
  };

  const calculateSmartContractRisk = (): number => {
    if (tokens.length === 0) return 0;
    const highRiskTokens = tokens.filter(
      (token) => token.riskScore === "high"
    ).length;
    const mediumRiskTokens = tokens.filter(
      (token) => token.riskScore === "medium"
    ).length;

    const riskScore = 80 - highRiskTokens * 30 - mediumRiskTokens * 15;
    return Math.max(10, Math.min(90, riskScore));
  };

  const riskMetrics: RiskMetric[] = [
    {
      name: "Diversification",
      score: calculateDiversification(),
      description:
        tokens.length > 3
          ? "Your portfolio is well diversified across different tokens"
          : tokens.length > 1
          ? "Consider adding more tokens for better diversification"
          : "Portfolio needs diversification across multiple tokens",
      icon: <Shield className="h-5 w-5 text-green-400" />,
    },
    {
      name: "Volatility Risk",
      score: calculateVolatilityRisk(),
      description:
        tokens.length > 0
          ? `Average 24h volatility: ${(
              tokens.reduce(
                (sum, token) => sum + Math.abs(token.priceChange24h),
                0
              ) / tokens.length
            ).toFixed(1)}%`
          : "No volatility data available",
      icon: <TrendingUp className="h-5 w-5 text-yellow-400" />,
    },
    {
      name: "Liquidity Risk",
      score: calculateLiquidityRisk(),
      description: tokens.some(
        (t) => t.symbol === "USDC" || t.symbol === "USDT"
      )
        ? "Good liquidity with stablecoin exposure"
        : "Consider adding stablecoins for better liquidity",
      icon: <Users className="h-5 w-5 text-green-400" />,
    },
    {
      name: "Smart Contract Risk",
      score: calculateSmartContractRisk(),
      description:
        tokens.filter((t) => t.riskScore === "high").length > 0
          ? "Some tokens have higher smart contract risks"
          : "Smart contract risk appears manageable",
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const overallRisk = Math.round(
    riskMetrics.reduce((acc, metric) => acc + metric.score, 0) /
      riskMetrics.length
  );

  return (
    <Card className="portfolio-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Risk Analysis</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Risk Score</p>
          <p className={`text-2xl font-bold ${getScoreColor(overallRisk)}`}>
            {overallRisk}/100
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {riskMetrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {metric.icon}
                <span className="font-medium">{metric.name}</span>
              </div>
              <span className={`font-semibold ${getScoreColor(metric.score)}`}>
                {metric.score}/100
              </span>
            </div>

            <Progress value={metric.score} className="h-2 bg-white/10" />

            <p className="text-sm text-muted-foreground">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
