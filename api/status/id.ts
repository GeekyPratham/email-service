import { VercelRequest, VercelResponse } from '@vercel/node';
import { EmailService } from '../../src/emailService';
import { MockProviderA } from '../../src/providers/mockProviderA';
import { MockProviderB } from '../../src/providers/mockProviderB';


const emailService = new EmailService(new MockProviderA(), new MockProviderB());

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const status = emailService.getStatus(id);

  if (status) {
    res.status(200).json(status);
  } else {
    res.status(404).json({ message: 'Status not found' });
  }
}
