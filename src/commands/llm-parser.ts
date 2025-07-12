import { ParsedCommand } from '../types';
import { openaiClient, ChatMessage } from '../services/openai-client';

const SYSTEM_PROMPT = `You are a command parser for SMS-based blockchain interactions.
Extract the action and parameters from user messages.

Supported actions:
1. swap: User wants to execute a swap transaction
2. send: User wants to send tokens to a specific address

CRITICAL RULES:
- SWAP: Use for "swap", "exchange", "convert", "SWAP" commands
- SEND: Use for "send", "transfer", "SEND" to addresses
- PERCENTAGES: Extract percentage for "50%", "25%" amounts
- "ALL": Extract "ALL" as amount for full balance operations
- TIMING: If the user says "for X times" or "every Y seconds/minutes", extract recurring (number of times) and timeGap (milliseconds between executions). If not present, omit from output.

EXAMPLES:
- "swap 1 mon to usdt" → action: "swap", amount: "1", tokenFrom: "MON", tokenTo: "USDT"
- "send 1 usdt to 0x1234...abcd" → action: "send", amount: "1", tokenFrom: "USDT", recipientAddress: "0x1234...abcd"
- "send 1 brewit to vijayankith.eth for 3 times for every 30 seconds" → action: "send", amount: "1", tokenFrom: "BREWIT", recipientAddress: "vijayankith.eth", recurring: 3, timeGap: 30000
- "send 2 usdt to alice.eth for 5 times every 10 seconds" → action: "send", amount: "2", tokenFrom: "USDT", recipientAddress: "alice.eth", recurring: 5, timeGap: 10000
- "send 0.5 mon to 0xabc... for 2 times every 1 minute" → action: "send", amount: "0.5", tokenFrom: "MON", recipientAddress: "0xabc...", recurring: 2, timeGap: 60000

For amounts, support: "1 MON", "50%", "ALL", "100 USDT"
For tokens, support: MON, USDT, USDC, BREWIT
For addresses, support: ENS names (wallet.eth) and hex addresses (0x1234...)
For timing: recurring (number of times), timeGap (milliseconds between executions)

ALWAYS respond with ONLY a valid JSON object containing the parsed command. If timing is not present in the message, omit recurring and timeGap from the output.`;

export async function parseCommand(message: string, phoneNumber: string): Promise<ParsedCommand> {
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Parse this SMS command: "${message}"` }
    ];

    const response = await openaiClient.chatCompletions({
      model: 'qwen3-0.6b-mlx',
      messages,
      temperature: 0.1,
      max_tokens: 200,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'command_parser_response',
          strict: true,
          schema: {
            type: 'object',
            properties: {
                              action: {
                  type: 'string',
                  enum: ['swap', 'send'],
                  description: 'The action to perform'
                },
              amount: {
                type: 'string',
                description: 'Amount to swap, quote, or send (e.g., "1 MON", "50%", "ALL")'
              },
              tokenFrom: {
                type: 'string',
                description: 'Source token symbol (e.g., "MON", "USDT") or specific token to check balance for'
              },
              tokenTo: {
                type: 'string',
                description: 'Destination token symbol (e.g., "USDT", "MON")'
              },
              percentage: {
                type: 'string',
                description: 'Percentage of balance to use (e.g., "50%")'
              },
              recipientAddress: {
                type: 'string',
                description: 'Recipient address for send action (e.g., "wallet.eth", "0x1234...")'
              },
              recurring: {
                type: 'number',
                description: 'Number of times to repeat the action (e.g., 3 for "3 times"; extract if present in the message)'
              },
              timeGap: {
                type: 'number',
                description: 'Time gap in milliseconds between executions (e.g., 30000 for "30 seconds"; extract if present in the message)'
              }
            },
            required: ['action'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from LLM');
    }

    // Try to extract JSON from the response - handle extra text after JSON
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: parsed.action,
          amount: parsed.amount,
          tokenFrom: parsed.tokenFrom,
          tokenTo: parsed.tokenTo,
          percentage: parsed.percentage,
          recipientAddress: parsed.recipientAddress,
          recurring: parsed.recurring,
          timeGap: parsed.timeGap
        };
      } catch (parseError) {
        console.error('Failed to parse JSON from LLM response:', parseError);
        console.error('Raw content:', content);
        throw new Error('Invalid JSON response from LLM');
      }
    }

    // If no JSON found, try to infer from the response text
    console.log('No JSON found, trying to infer from response:', content);
    throw new Error('No JSON found in LLM response');
  } catch (error) {
    console.error('LLM parsing failed:', error);
    throw error;
  }
} 