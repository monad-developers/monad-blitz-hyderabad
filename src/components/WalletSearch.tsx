import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, AlertCircle } from 'lucide-react';
import { blockchainService } from '@/services/blockchain';

interface WalletSearchProps {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

export const WalletSearch = ({ onSearch, isLoading }: WalletSearchProps) => {
  const [searchAddress, setSearchAddress] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    const isValid = await blockchainService.validateAddress(searchAddress);
    if (!isValid) {
      setError('Invalid wallet address format');
      return;
    }

    setError('');
    onSearch(searchAddress);
  };

  const handleInputChange = (value: string) => {
    setSearchAddress(value);
    setError('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Wallet Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={searchAddress}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !searchAddress.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Enter any Monad wallet address to analyze its token portfolio and get AI-powered recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};