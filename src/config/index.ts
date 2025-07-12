import { config } from 'dotenv';

config();

export const CONFIG = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    apiSecret: process.env.TWILIO_API_SECRET!,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: process.env.OPENAI_BASE_URL || 'http://localhost:1234/v1',
  },
  blockchain: {
    rpcUrl: process.env.MONAD_RPC_URL || 'https://rpc.testnet.monad.xyz',
    chainId: parseInt(process.env.MONAD_CHAIN_ID || '1337'),
  },
  brewit: {
    salt: process.env.BREWIT_SALT || 'https://api.brewit.money',
    account: process.env.BREWIT_ACCOUNT!,
  },
};

// Validate required environment variables
const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_API_SECRET', 
  'TWILIO_PHONE_NUMBER',
  'OPENAI_API_KEY'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
} 