import twilio from 'twilio';
import { CONFIG } from '../config';

// Debug: Log credential types (without exposing full values)
console.log(`🔑 Twilio Account SID: ${CONFIG.twilio.accountSid.substring(0, 10)}... (length: ${CONFIG.twilio.accountSid.length})`);
console.log(`🔑 Twilio API Secret: ${CONFIG.twilio.apiSecret.substring(0, 10)}... (length: ${CONFIG.twilio.apiSecret.length})`);
console.log(`🔑 Twilio Phone Number: ${CONFIG.twilio.phoneNumber}`);

// Initialize Twilio client with Account SID and Auth Token
const client = twilio(CONFIG.twilio.accountSid, CONFIG.twilio.apiSecret);

export async function sendSms(to: string, message: string): Promise<void> {
  try {
    console.log(`📤 Attempting to send SMS to ${to} from ${CONFIG.twilio.phoneNumber}`);
    console.log(`📤 Message length: ${message.length} characters`);
    
    const result = await client.messages.create({
      body: message,
      from: CONFIG.twilio.phoneNumber,
      to: to
    });
    
    console.log(`✅ SMS sent successfully!`);
    console.log(`📤 Message SID: ${result.sid}`);
    console.log(`📤 Status: ${result.status}`);
    console.log(`📤 To: ${result.to}`);
    console.log(`📤 From: ${result.from}`);
    console.log(`📤 Message preview: ${message.substring(0, 100)}...`);
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error);
    throw error;
  }
} 