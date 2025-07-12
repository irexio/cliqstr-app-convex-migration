import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

/**
 * Send an SMS using Twilio Messaging Service
 * @param to Recipient phone number (E.164 format, e.g. +15555555555)
 * @param body Text message body
 * @returns Twilio API response
 */
export async function sendParentApprovalSMS(to: string, body: string) {
  return client.messages.create({
    to,
    body,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
  });
}
