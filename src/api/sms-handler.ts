import { FastifyInstance } from 'fastify';
import { TwilioSmsRequest } from '../types';
import { parseCommand } from '../commands/llm-parser';
import { handleSwap, handleSend } from '../services/actions';

export async function smsHandlerRoute(fastify: FastifyInstance) {
  fastify.post('/api/sms-handler', async (request, reply) => {
    const body = request.body as TwilioSmsRequest;
    
    // Log incoming SMS details
    console.log(`📱 Incoming phone number: ${body.From}`);
    console.log(`💬 Incoming message: "${body.Body}"`);
    
    // Validate sender format
    if (!/^\+\d{10,15}$/.test(body.From)) {
      console.log(`❌ Invalid phone format: ${body.From}`);
      return reply.status(400).send('Invalid sender format');
    }
    // Parse command using LLM
    let parsed;
    try {
      parsed = await parseCommand(body.Body, body.From);
    } catch (e) {
      //TODO: need to fix - handle parse failure gracefully
      return reply.status(200).send('<Response><Message>Sorry, could not understand your command.</Message></Response>');
    }
    // Dispatch to action handler
    switch (parsed.action) {
      case 'swap':
        return handleSwap(body, reply, parsed);
      case 'send':
        return handleSend(body, reply, parsed);
      default:
        //TODO: need to fix - handle unknown action
        return reply.status(200).send('<Response><Message>Unknown command.</Message></Response>');
    }
  });
}
//TODO: need to fix - add Twilio XML response helpers. 