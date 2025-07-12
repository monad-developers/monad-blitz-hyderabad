export interface ParsedCommand {
  action: 'swap' | 'send';
  amount?: string;
  tokenFrom?: string;
  tokenTo?: string;
  percentage?: string;
  recipientAddress?: string;
  recurring?: number;
  timeGap?: number;
}



export interface TwilioSmsRequest {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  AccountSid: string;
}

export interface TwilioSmsResponse {
  MessageSid: string;
  Status: string;
}

export interface SwapQuote {
  tokenFrom: string;
  tokenTo: string;
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  gasEstimate: string;
}

export interface TokenBalance {
  token: string;
  balance: string;
  symbol: string;
  decimals: number;
}

export interface BrewitDelegationStatus {
  isDelegated: boolean;
  safeAddress: string;
  delegateAddress: string;
} 