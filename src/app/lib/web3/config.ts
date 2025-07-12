// Web3 Configuration
export const WEB3_CONFIG = {
  // Network configurations
  NETWORKS: {
    MONAD_TESTNET: {
      chainId: 10143,
      chainIdHex: '0x279F',
      name: 'Monad Testnet',
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      blockExplorer: 'https://testnet.monadexplorer.com',
      faucet: 'https://testnet.monad.xyz',
      nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18,
      },
    },
    ETHEREUM_MAINNET: {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
      blockExplorer: 'https://etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
    POLYGON_MAINNET: {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-rpc.com',
      blockExplorer: 'https://polygonscan.com',
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      },
    },
    SEPOLIA_TESTNET: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      blockExplorer: 'https://sepolia.etherscan.io',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
    },
  },
  
  // Default network (you can change this based on your needs)
  DEFAULT_NETWORK: 'MONAD_TESTNET',
  
  // Native currency configuration (MON is the native currency, not an ERC-20 token)
  NATIVE_CURRENCY: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18,
  },
  
  // Game reward settings
  GAME_REWARDS: {
    COINS_TO_MON_RATIO: 0.05, // 1 game coin = 0.05 MON
    MIN_COINS_TO_REDEEM: 1, // Minimum 1 coin to redeem
    MAX_COINS_TO_REDEEM: 1000,
  },
  
  // Transaction settings
  TRANSACTION: {
    GAS_BUFFER_MULTIPLIER: 1.2, // 20% buffer above estimated gas
    GAS_PRICE_MULTIPLIER: 1.2, // 20% above estimated gas price
  },
} as const;

// Your wallet's private key (THIS SHOULD BE IN ENVIRONMENT VARIABLES IN PRODUCTION!)
export const SENDER_PRIVATE_KEY = process.env.NEXT_PUBLIC_SENDER_PRIVATE_KEY || '';

// Validation
export const validateConfig = () => {
  if (!SENDER_PRIVATE_KEY) {
    console.warn('SENDER_PRIVATE_KEY not found in environment variables');
  }
  
  const defaultNetwork = WEB3_CONFIG.NETWORKS[WEB3_CONFIG.DEFAULT_NETWORK];
  if (!defaultNetwork) {
    throw new Error('Default network configuration not found');
  }
  
  return true;
}; 