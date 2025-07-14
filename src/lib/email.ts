import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  // No-op stub for legacy compatibility
  return Promise.resolve();
}
