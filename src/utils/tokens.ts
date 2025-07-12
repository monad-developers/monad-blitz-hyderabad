import { promises as fs } from 'fs';
import path from 'path';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

export interface TokenList {
  tokens: Token[];
}

let cachedTokens: Token[] | null = null;

export async function getDemoTokens(): Promise<Token[]> {
  if (cachedTokens) {
    return cachedTokens;
  }

  try {
    const tokensPath = path.join(__dirname, '../config/tokens.json');
    const data = await fs.readFile(tokensPath, 'utf-8');
    const tokenList: TokenList = JSON.parse(data);
    
    // Validate token data
    const validTokens = tokenList.tokens.filter(token => 
      token.symbol && 
      token.name && 
      token.address && 
      token.address.length === 42 && 
      token.address.startsWith('0x') &&
      typeof token.decimals === 'number' &&
      token.logo
    );

    if (validTokens.length === 0) {
      throw new Error('No valid tokens found in tokens.json');
    }

    cachedTokens = validTokens;
    console.log(`✅ Loaded ${validTokens.length} demo tokens: ${validTokens.map(t => t.symbol).join(', ')}`);
    
    return validTokens;
  } catch (error) {
    console.error('❌ Failed to load demo tokens:', error);
    throw error;
  }
}

export function findTokenBySymbol(symbol: string): Token | undefined {
  if (!cachedTokens) {
    throw new Error('Tokens not loaded. Call getDemoTokens() first.');
  }
  
  return cachedTokens.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function findTokenByAddress(address: string): Token | undefined {
  if (!cachedTokens) {
    throw new Error('Tokens not loaded. Call getDemoTokens() first.');
  }
  
  return cachedTokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
}

export function getSupportedTokenSymbols(): string[] {
  if (!cachedTokens) {
    throw new Error('Tokens not loaded. Call getDemoTokens() first.');
  }
  
  return cachedTokens.map(token => token.symbol);
} 