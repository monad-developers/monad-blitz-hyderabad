import { TwilioSmsRequest, ParsedCommand } from '../types';
import { sendSms } from './twilio';
import { swap, send } from './brewit';
import { findTokenBySymbol } from '../utils/tokens';
import { resolveENS } from '../utils/ens';



export async function handleSwap(body: TwilioSmsRequest, reply: any, parsed: ParsedCommand) {
  try {
    // Validate required parameters
    if (!parsed.tokenFrom || !parsed.tokenTo || !parsed.amount) {
      const errorMessage = `❌ Invalid swap command. Format: SWAP <amount> <token> TO <token>
Example: SWAP 0.001 USDT TO MON`;



      await sendSms(body.From, errorMessage);
      return reply
        .header('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
    }

    let recurring: number = 1;
    let timeGap: number = 3000

    if (parsed.recurring) {
      recurring = parsed.recurring;
    }

    if (parsed.timeGap) {
      timeGap = parsed.timeGap;
    }

    // Find tokens by symbol
    const fromToken = findTokenBySymbol(parsed.tokenFrom);
    const toToken = findTokenBySymbol(parsed.tokenTo);

    if (!fromToken || !toToken) {
      const supportedTokens = ['MON', 'USDT', 'USDC', 'BREWIT'].join(', ');
      const errorMessage = `❌ Unsupported token. Supported tokens: ${supportedTokens}`;

      await sendSms(body.From, errorMessage);
      return reply
        .header('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
    }

    // Execute swap via Brewit
    console.log(`🔄 Executing swap: ${parsed.amount} ${fromToken.symbol} → ${toToken.symbol}`);

    const result = await swap(
      fromToken.address,
      toToken.address,
      parsed.amount,
      recurring,
      timeGap
    );

    const successMessage = `✅ Swap executed successfully!

${parsed.amount} ${fromToken.symbol} → ${toToken.symbol}
${fromToken.logo} ${fromToken.name} → ${toToken.logo} ${toToken.name}

Transaction ID: ${(result as any)?.id || 'Pending'}`;

    await sendSms(body.From, successMessage);
    console.log(`✅ Swap completed for ${body.From}: ${parsed.amount} ${fromToken.symbol} → ${toToken.symbol}`);

    return reply
      .header('Content-Type', 'text/xml')
      .status(200)
      .send('<Response></Response>');

  } catch (error) {
    console.error(`❌ Swap failed for ${body.From}:`, error);

    const errorMessage = `❌ Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check your balance.`;

    try {
      await sendSms(body.From, errorMessage);
    } catch (smsError) {
      console.error(`❌ Failed to send error SMS to ${body.From}:`, smsError);
    }

    return reply
      .header('Content-Type', 'text/xml')
      .status(200)
      .send('<Response></Response>');
  }
}

export async function handleSend(body: TwilioSmsRequest, reply: any, parsed: ParsedCommand) {
  try {
    // Debug: Log the parsed command
    console.log(`🔍 Parsed send command:`, JSON.stringify(parsed, null, 2));

    // Validate required parameters - handle both tokenFrom and tokenTo for send commands
    const tokenSymbol = parsed.tokenTo || parsed.tokenFrom;
    if (!tokenSymbol || !parsed.recipientAddress || !parsed.amount) {
      const errorMessage = `❌ Invalid send command. Format: SEND <amount> <token> TO <address>
Example: SEND 0.001 USDT TO 0x1234...abcd

Parsed: ${JSON.stringify(parsed)}`;

      await sendSms(body.From, errorMessage);
      return reply
        .header('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
    }

    let recurring: number = 1;
    let timeGap: number = 3000

    if (parsed.recurring) {
      recurring = parsed.recurring;
    }

    if (parsed.timeGap) {
      timeGap = parsed.timeGap;
    }

    // Find token by symbol
    const token = findTokenBySymbol(tokenSymbol);

    if (!token) {
      const supportedTokens = ['MON', 'USDT', 'USDC', 'BREWIT'].join(', ');
      const errorMessage = `❌ Unsupported token. Supported tokens: ${supportedTokens}`;

      await sendSms(body.From, errorMessage);
      return reply
        .header('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
    }

    // Resolve ENS or validate Ethereum address
    let resolvedAddress = await resolveENS(parsed.recipientAddress);

    if (!resolvedAddress) {
      const errorMessage = `❌ Invalid recipient address. Must be a valid Ethereum address (0x...) or ENS name (.eth).`;

      await sendSms(body.From, errorMessage);
      return reply
        .header('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
    }

    // Execute send via Brewit
    console.log(`📤 Executing send: ${parsed.amount} ${token.symbol} to ${resolvedAddress}`);

    const result = await send(
      token.address,
      resolvedAddress,
      parsed.amount,
      parsed.recurring || 1,
      parsed.timeGap || 3000
    );

    const successMessage = `✅ Send executed successfully!

${parsed.amount} ${token.symbol} ${token.logo} ${token.name}
To: ${resolvedAddress.substring(0, 10)}...${resolvedAddress.substring(38)}
${parsed.recipientAddress.endsWith('.eth') ? `ENS: ${parsed.recipientAddress}` : ''}

Transaction ID: ${(result as any)?.id || 'Pending'}`;

    await sendSms(body.From, successMessage);
    console.log(`✅ Send completed for ${body.From}: ${parsed.amount} ${token.symbol} to ${resolvedAddress}`);

    return reply
      .header('Content-Type', 'text/xml')
      .status(200)
      .send('<Response></Response>');

  } catch (error) {
    console.error(`❌ Send failed for ${body.From}:`, error);

    const errorMessage = `❌ Send failed: ${error instanceof Error ? error.message : 'Unknown error'}

Please try again or check your balance.`;

    try {
      await sendSms(body.From, errorMessage);
    } catch (smsError) {
      console.error(`❌ Failed to send error SMS to ${body.From}:`, smsError);
    }

    return reply
      .header('Content-Type', 'text/xml')
      .status(200)
      .send('<Response></Response>');
  }
}

