import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Target,
} from "lucide-react";

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

interface Recommendation {
  type: "buy" | "sell" | "hold" | "diversify";
  token?: string;
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
}

interface RecommendationEngineProps {
  tokens?: Token[];
}

export const RecommendationEngine = ({
  tokens = [],
}: RecommendationEngineProps) => {
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const totalValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);

    // Diversification recommendations
    if (tokens.length === 1) {
      recommendations.push({
        type: "diversify",
        title: "Diversify your portfolio",
        description:
          "Your portfolio consists of only one token, which increases risk",
        confidence: 85,
        reasoning: [
          "Single token concentration is risky",
          "Consider adding stablecoins for stability",
          "Add tokens from different sectors",
        ],
      });
    } else if (tokens.length < 3) {
      recommendations.push({
        type: "diversify",
        title: "Add more diversification",
        description:
          "Consider adding 2-3 more tokens to reduce concentration risk",
        confidence: 70,
        reasoning: [
          "Portfolio could benefit from more tokens",
          "Reduce single-token risk exposure",
          "Better risk-adjusted returns possible",
        ],
      });
    }

    // High-risk token recommendations
    const highRiskTokens = tokens.filter((token) => token.riskScore === "high");
    if (highRiskTokens.length > 0) {
      const largestHighRisk = highRiskTokens.reduce((max, token) =>
        token.usdValue > max.usdValue ? token : max
      );

      recommendations.push({
        type: "sell",
        token: largestHighRisk.symbol,
        title: `Reduce ${largestHighRisk.symbol} exposure`,
        description: "High risk token with significant portfolio allocation",
        confidence: Math.min(
          90,
          60 + (largestHighRisk.usdValue / totalValue) * 100
        ),
        reasoning: [
          `${largestHighRisk.symbol} has high risk score`,
          `Represents ${((largestHighRisk.usdValue / totalValue) * 100).toFixed(
            1
          )}% of portfolio`,
          "Consider taking some profits",
        ],
      });
    }

    // Performance-based recommendations
    const performingTokens = tokens.filter((token) => token.priceChange24h > 5);
    const underperformingTokens = tokens.filter(
      (token) => token.priceChange24h < -10
    );

    if (performingTokens.length > 0) {
      const bestPerformer = performingTokens.reduce((max, token) =>
        token.priceChange24h > max.priceChange24h ? token : max
      );

      if (bestPerformer.usdValue / totalValue < 0.3) {
        // Less than 30% of portfolio
        recommendations.push({
          type: "buy",
          token: bestPerformer.symbol,
          title: `Consider increasing ${bestPerformer.symbol} position`,
          description:
            "Strong recent performance with room for larger allocation",
          confidence: 65,
          reasoning: [
            `${bestPerformer.priceChange24h.toFixed(1)}% gain in 24h`,
            `Currently ${((bestPerformer.usdValue / totalValue) * 100).toFixed(
              1
            )}% of portfolio`,
            "Positive momentum indicator",
          ],
        });
      }
    }

    if (underperformingTokens.length > 0) {
      const worstPerformer = underperformingTokens.reduce((min, token) =>
        token.priceChange24h < min.priceChange24h ? token : min
      );

      recommendations.push({
        type: "hold",
        token: worstPerformer.symbol,
        title: `Monitor ${worstPerformer.symbol} closely`,
        description: "Significant recent decline warrants careful observation",
        confidence: 55,
        reasoning: [
          `${worstPerformer.priceChange24h.toFixed(1)}% decline in 24h`,
          "Could be a buying opportunity if fundamentals remain strong",
          "Consider dollar-cost averaging if you believe in the project",
        ],
      });
    }

    // Stablecoin recommendations
    const hasStablecoins = tokens.some(
      (token) =>
        token.symbol === "USDC" ||
        token.symbol === "USDT" ||
        token.symbol === "DAI"
    );

    if (!hasStablecoins && tokens.length > 0) {
      recommendations.push({
        type: "buy",
        title: "Add stablecoin exposure",
        description: "Consider allocating 10-20% to stablecoins for stability",
        confidence: 75,
        reasoning: [
          "No stablecoin exposure detected",
          "Stablecoins provide portfolio stability",
          "Good for taking profits during volatility",
        ],
      });
    }

    // MON-specific recommendations
    const monToken = tokens.find((token) => token.symbol === "MON");
    if (monToken) {
      if (monToken.usdValue / totalValue > 0.8) {
        // More than 80% MON
        recommendations.push({
          type: "diversify",
          token: "MON",
          title: "Reduce MON concentration",
          description:
            "High allocation to native token increases network-specific risk",
          confidence: 80,
          reasoning: [
            `MON represents ${((monToken.usdValue / totalValue) * 100).toFixed(
              1
            )}% of portfolio`,
            "Single network exposure is risky",
            "Consider diversifying to other ecosystems",
          ],
        });
      } else if (monToken.usdValue / totalValue < 0.2 && tokens.length > 2) {
        // Less than 20% MON
        recommendations.push({
          type: "buy",
          token: "MON",
          title: "Consider increasing MON allocation",
          description:
            "Native token underweight for Monad ecosystem participation",
          confidence: 60,
          reasoning: [
            "Low exposure to native Monad token",
            "MON needed for transaction fees",
            "Potential ecosystem growth opportunities",
          ],
        });
      }
    }

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  };

  const recommendations = generateRecommendations();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "sell":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "hold":
        return <DollarSign className="h-4 w-4 text-yellow-400" />;
      case "diversify":
        return <Target className="h-4 w-4 text-blue-400" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-green-400/10 text-green-400 border-green-400/20";
      case "sell":
        return "bg-red-400/10 text-red-400 border-red-400/20";
      case "hold":
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
      case "diversify":
        return "bg-blue-400/10 text-blue-400 border-blue-400/20";
      default:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20";
    }
  };

  if (tokens.length === 0) {
    return (
      <Card className="portfolio-card">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold gradient-text">
            AI Recommendations
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Connect a wallet or search for an address to get personalized AI
            recommendations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="portfolio-card">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold gradient-text">
          AI Recommendations
        </h2>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-white/10 bg-white/5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(rec.type)}
                <h3 className="font-semibold">{rec.title}</h3>
                {rec.token && (
                  <Badge variant="outline" className="text-xs">
                    {rec.token}
                  </Badge>
                )}
              </div>
              <Badge className={getTypeColor(rec.type)}>
                {rec.confidence}% confidence
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {rec.description}
            </p>

            <div className="space-y-1 mb-4">
              <p className="text-xs font-medium text-muted-foreground">
                Key factors:
              </p>
              {rec.reasoning.map((reason, idx) => (
                <p
                  key={idx}
                  className="text-xs text-muted-foreground flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {reason}
                </p>
              ))}
            </div>

            <Button size="sm" variant="outline" className="w-full">
              View Details
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
