
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface PortfolioOverviewProps {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
}

export const PortfolioOverview = ({ totalValue, dayChange, dayChangePercent }: PortfolioOverviewProps) => {
  const isPositive = dayChange >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="portfolio-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="portfolio-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Change</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(dayChange).toLocaleString()}
              </p>
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-400/10' : 'bg-red-400/10'}`}>
            <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{dayChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </Card>

      <Card className="portfolio-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Portfolio Health</p>
            <p className="text-2xl font-bold text-green-400">Good</p>
          </div>
          <div className="p-3 rounded-lg bg-green-400/10">
            <PieChart className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};
