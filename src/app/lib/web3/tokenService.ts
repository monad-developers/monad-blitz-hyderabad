import { ethers } from 'ethers';
import { WEB3_CONFIG, SENDER_PRIVATE_KEY, validateConfig } from './config';
import { TokenTransactionParams, GameRedemptionParams } from './types';

// ERC-20 Token ABI (minimal for transfer function)
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export class TokenService {
  private provider: ethers.JsonRpcProvider;
  private senderWallet: ethers.Wallet;
  private networkConfig: any;

  constructor() {
    // Validate configuration
    validateConfig();
    
    // Get network configuration
    this.networkConfig = WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK];
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);
    
    // Initialize sender wallet with private key
    if (!SENDER_PRIVATE_KEY) {
      throw new Error('Sender private key not configured');
    }
    
    this.senderWallet = new ethers.Wallet(SENDER_PRIVATE_KEY, this.provider);
  }

  /**
   * Send MON (native currency) to a recipient address
   */
  async sendMON(recipientAddress: string, amount: string): Promise<string> {
    try {
      // Validate recipient address
      if (!ethers.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

              // Convert amount to wei (MON has 18 decimals like ETH)
        const amountInWei = ethers.parseEther(amount);

        // Check sender balance
        const senderBalance = await this.provider.getBalance(this.senderWallet.address);
        if (senderBalance < amountInWei) {
          throw new Error('Insufficient MON balance in sender wallet');
        }

        // Prepare transaction
        const transaction = {
          to: recipientAddress,
          value: amountInWei,
          gasLimit: WEB3_CONFIG.TRANSACTION.GAS_LIMIT,
        };

        // Send transaction
        const tx = await this.senderWallet.sendTransaction(transaction);
        
        // Wait for confirmation
        await tx.wait();
        
        return tx.hash;
      } catch (error) {
        console.error('Error sending MON:', error);
        throw error;
      }
    }

    /**
     * Send native MON tokens (not ERC-20, just native currency transfer)
     */
    async sendTokens(params: TokenTransactionParams): Promise<string> {
      // Since MON is native currency, we just use the sendMON method
      return this.sendMON(params.recipientAddress, params.amount);
    }

  /**
   * Redeem game coins for tokens
   */
  async redeemGameCoins(params: GameRedemptionParams): Promise<string> {
    try {
      const { coins, userAddress } = params;

      // Validate minimum coins
      if (coins < WEB3_CONFIG.GAME_REWARDS.MIN_COINS_TO_REDEEM) {
        throw new Error(`Minimum ${WEB3_CONFIG.GAME_REWARDS.MIN_COINS_TO_REDEEM} coins required to redeem`);
      }

      // Validate maximum coins
      if (coins > WEB3_CONFIG.GAME_REWARDS.MAX_COINS_TO_REDEEM) {
        throw new Error(`Maximum ${WEB3_CONFIG.GAME_REWARDS.MAX_COINS_TO_REDEEM} coins allowed per redemption`);
      }

      // Calculate MON amount based on coins
      const monAmount = (coins * WEB3_CONFIG.GAME_REWARDS.COINS_TO_MON_RATIO).toString();

      // Send MON to user
      const txHash = await this.sendTokens({
        recipientAddress: userAddress,
        amount: monAmount,
      });

      return txHash;
    } catch (error) {
      console.error('Error redeeming game coins:', error);
      throw error;
    }
  }

  /**
   * Get sender wallet balance
   */
  async getSenderBalance(): Promise<{ eth: string; tokens: string }> {
    try {
      // Get ETH balance
      const ethBalance = await this.provider.getBalance(this.senderWallet.address);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);

      // Since MON is native currency, we don't need to check token balance
      // MON balance is the same as the wallet's native balance
      const monBalance = ethBalanceFormatted;

      return {
        eth: ethBalanceFormatted,
        tokens: monBalance,
      };
    } catch (error) {
      console.error('Error getting sender balance:', error);
      throw error;
    }
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      name: this.networkConfig.name,
      chainId: this.networkConfig.chainId,
      blockExplorer: this.networkConfig.blockExplorer,
    };
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(txHash: string) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        hash: txHash,
        status: receipt?.status === 1 ? 'success' : 'failed',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        explorerUrl: `${this.networkConfig.blockExplorer}/tx/${txHash}`,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService(); 