import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Welcome to Resilient Email Service API!',
    routes: ['/api/send-email.ts', '/api/status/id.ts']
  });
}
