import { VercelRequest, VercelResponse } from '@vercel/node';
import { EmailService } from '../src/emailService';
import { MockProviderA } from '../src/providers/mockProviderA';
import { MockProviderB } from '../src/providers/mockProviderB';

const emailService = new EmailService(new MockProviderA(), new MockProviderB());

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body, idempotencyKey } = req.body;

  if (!to || !subject || !body || !idempotencyKey) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await emailService.sendEmail(to, subject, body, idempotencyKey);
    res.status(200).json({ success: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}
