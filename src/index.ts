import Fastify from 'fastify';
import { smsHandlerRoute } from './api/sms-handler';
import { CONFIG } from './config';
import { getDemoTokens } from './utils/tokens';

async function main() {
  const fastify = Fastify({ 
    logger: {
      level: 'error' // Only log errors, not all requests
    }
  });
  
  // Load demo tokens on startup
  try {
    await getDemoTokens();
  } catch (error) {
    console.error('❌ Failed to load demo tokens on startup:', error);
    process.exit(1);
  }
  
  // Register form parser for Twilio webhooks
  fastify.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, function (req, body, done) {
    try {
      const parsed = new URLSearchParams(body as string);
      const result: Record<string, string> = {};
      for (const [key, value] of parsed) {
        result[key] = value;
      }
      done(null, result);
    } catch (err) {
      done(err as Error);
    }
  });
  
  await smsHandlerRoute(fastify);
  fastify.listen({ port: CONFIG.server.port, host: CONFIG.server.host }, (err, address) => {
    if (err) {
      //TODO: need to fix - proper error handling
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

main(); 