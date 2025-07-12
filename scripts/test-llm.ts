import { parseCommand } from '../src/commands/llm-parser';
import { openaiClient } from '../src/services/openai-client';

async function testLLMIntegration() {
  console.log('🧪 Testing LLM Integration with LM Studio...\n');

  // Test 1: Check if we can connect to LM Studio
  try {
    console.log('1. Testing connection to LM Studio...');
    const models = await openaiClient.getModels();
    console.log('✅ Connected to LM Studio');
    console.log('Available models:', models.map(m => m.id));
  } catch (error) {
    console.log('❌ Failed to connect to LM Studio:', error);
    console.log('Make sure LM Studio is running on http://localhost:1234');
    console.log('And set your environment variables (copy from env.example to .env)');
    return;
  }

  // Test 2: Test AI command parsing for all actions
  const testMessages = [
    // Basic actions
    'REGISTER',
    'VERIFY',
    'BALANCE',
    
    // Quote actions
    'QUOTE FOR 1 MON',
    'Get a quote for 2.5 ETH',
    'I need a quote for 100 USDT to MON',
    
    // Swap actions
    'SWAP 1 MON TO USDT',
    'SWAP 50% OF MY MON TO USDT',
    'SWAP ALL MON TO USDT',
    'I want to swap 2.5 MON to USDC',
    'swap 10 eth to usdt',
    'Convert 25% of my balance to USDT',
    
    // Send actions
    'SEND 1 USDT TO wallet.eth',
    'Send 0.5 ETH to 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    'Transfer 100 MON to alice.eth',
    'I want to send 50 USDC to 0x1234567890abcdef',
    
    // Natural language variations
    'Check my token balances',
    'Show me my MON balance',
    'Balance of ETH',
    'What\'s my USDT balance?',
    'I want to register a new wallet',
    'Verify my delegation status',
    'How much will I get for swapping 5 MON?'
  ];

  console.log('\n2. Testing AI command parsing...');
  
  for (const message of testMessages) {
    try {
      console.log(`\n📱 Testing: "${message}"`);
      const result = await parseCommand(message, '+1234567890');
      console.log(`✅ AI Parsed:`, JSON.stringify(result, null, 2));
    } catch (error) {
      console.log(`❌ Failed to parse "${message}":`, error);
    }
  }

  console.log('\n🎉 LLM Integration test completed!');
  console.log('\nNote: This test uses the actual LLM via LM Studio.');
  console.log('If parsing fails, it will fall back to regex patterns.');
}

// Run the test
testLLMIntegration().catch(console.error); 