import { ethers } from "ethers";

// Monad testnet configuration
const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";
const MONAD_CHAIN_ID = 10143;

// ERC-20 ABI for balance checking
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
];

// Token addresses to check (from user)
const COMMON_TOKENS: string[] = [
  "0xE0590015A873bF326bd645c3E1266d4db41C4E6B",
  "0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3",
  "0xC8527e96c3CB9522f6E35e95C0A28feAb8144f15",
  "0x3a98250F98Dd388C211206983453837C8365BDc1",
  "0x0F0BDEbF0F83cD1EE3974779Bcb7315f9808c714",
  "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701",
  "0xfe140e1dCe99Be9F4F15d657CD9b7BF622270C50",
  "0xb2f82D0f38dc453D596Ad40A37799446Cc89274A",
];

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  priceChange24h: number;
  riskScore: "low" | "medium" | "high";
  recommendation: "buy" | "hold" | "sell";
  marketCap: number;
  address: string;
  totalSupply?: number;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      console.log(`Fetching balances for wallet: ${walletAddress}`);
      const balances: TokenBalance[] = [];

      // Native MON balance
      const nativeBalance = await this.provider.getBalance(walletAddress);
      const monBalance = parseFloat(ethers.formatEther(nativeBalance));

      if (monBalance > 0) {
        balances.push({
          symbol: "MON",
          name: "Monad",
          balance: monBalance,
          usdValue: monBalance * 0.1,
          priceChange24h: this.generateRealisticPriceChange(),
          riskScore: "low",
          recommendation: this.generateRecommendation(monBalance, "MON"),
          marketCap: 50000000,
          address: "0x0000000000000000000000000000000000000000",
          totalSupply: 1000000000,
        });
      }

      // Check all provided token addresses
      for (const tokenAddress of COMMON_TOKENS) {
        try {
          console.log(`Checking token at: ${tokenAddress}`);
          const tokenData = await this.getTokenBalance(
            walletAddress,
            tokenAddress
          );
          if (tokenData && tokenData.balance > 0) {
            console.log(`${tokenData.symbol} balance: ${tokenData.balance}`);
            balances.push(tokenData);
          }
        } catch (error) {
          console.warn(
            `Failed to fetch balance for token ${tokenAddress}:`,
            error
          );
        }
      }

      console.log(`Total tokens found: ${balances.length}`);
      return balances;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      throw new Error("Failed to fetch token balances");
    }
  }

  private async getTokenBalance(
    walletAddress: string,
    tokenAddress: string
  ): Promise<TokenBalance | null> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider
      );
      const [balance, decimals, symbol, name, totalSupply] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
        contract.name(),
        contract.totalSupply().catch(() => BigInt(0)),
      ]);

      const formattedBalance = parseFloat(
        ethers.formatUnits(balance, decimals)
      );
      const formattedTotalSupply = parseFloat(
        ethers.formatUnits(totalSupply, decimals)
      );

      if (formattedBalance <= 0) return null;

      return {
        symbol,
        name,
        balance: formattedBalance,
        usdValue: formattedBalance * this.getMockPrice(symbol),
        priceChange24h: this.generateRealisticPriceChange(),
        riskScore: this.calculateRiskScore(
          formattedBalance,
          formattedTotalSupply,
          symbol
        ),
        recommendation: this.generateRecommendation(formattedBalance, symbol),
        marketCap: formattedTotalSupply * this.getMockPrice(symbol),
        address: tokenAddress,
        totalSupply: formattedTotalSupply,
      };
    } catch (error) {
      console.warn(`Failed to get token data for ${tokenAddress}:`, error);
      return null;
    }
  }

  private getMockPrice(symbol: string): number {
    const prices: Record<string, number> = {
      MON: 0.1,
      USDC: 1,
      USDT: 1,
      WETH: 2000,
      WBTC: 45000,
    };
    return prices[symbol] ?? Math.random() * 10;
  }

  private generateRealisticPriceChange(): number {
    return (Math.random() - 0.5) * 40;
  }

  private calculateRiskScore(
    balance: number,
    totalSupply: number,
    symbol: string
  ): "low" | "medium" | "high" {
    if (["MON", "USDC", "USDT"].includes(symbol)) return "low";
    const concentration = balance / totalSupply;
    if (concentration > 0.05) return "high";
    if (concentration > 0.01) return "medium";
    return "low";
  }

  private generateRecommendation(
    balance: number,
    symbol: string
  ): "buy" | "hold" | "sell" {
    if (symbol === "MON") return balance > 1000 ? "hold" : "buy";
    if (balance > 10000) return "sell";
    if (balance < 100) return "buy";
    return "hold";
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();
