// Express server to handle email sending requests
import express from 'express';
import { EmailService } from './emailService';
import { Queue } from './queue';
import { MockProviderA } from './providers/mockProviderA';
import { MockProviderB } from './providers/mockProviderB';
import { EmailTask } from './interfaces/EmailTask';

const app = express();
app.use(express.json());

const emailService = new EmailService(new MockProviderA(), new MockProviderB());
const queue = new Queue(async (task: EmailTask) => {
  try {
    const result = await emailService.sendEmail(task.to, task.subject, task.body, task.idempotencyKey);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${task.to}:`, error);
    return false;
  }
});

// Endpoint to queue an email for sending
app.post('/send-email/*', async (req, res) => {
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
});


// Endpoint to check email status
app.get('/status/:id/*', (req, res) => {
  const status = emailService.getStatus(req.params.id);
  if (status) {
    res.json(status);
  } else {
    res.status(404).json({ message: 'Status not found' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
