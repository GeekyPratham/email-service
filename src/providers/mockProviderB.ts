// Mock email provider B simulating real-world email sending with random success/failure
import { EmailProvider } from '../interfaces/EmailProvider';

export class MockProviderB implements EmailProvider {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`MockProviderB: Attempting to send email to ${to}`);
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    if (success) {
      console.log(`MockProviderB: Email sent to ${to}`);
      return true;
    } else {
      console.log(`MockProviderB: Failed to send email to ${to}`);
      return false;
    }
  }
}
