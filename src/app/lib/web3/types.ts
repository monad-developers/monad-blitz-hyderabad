export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  provider: any;
  signer: any;
}

export interface TokenTransactionParams {
  recipientAddress: string;
  amount: string;
  // tokenAddress removed since MON is native currency
}

export interface Web3ContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sendTokens: (params: TokenTransactionParams) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export interface GameRedemptionParams {
  coins: number;
  userAddress: string;
} 