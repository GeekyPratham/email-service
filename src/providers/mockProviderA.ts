// Mock email provider A simulating real-world email sending with random success/failure
import { EmailProvider } from '../interfaces/EmailProvider';

export class MockProviderA implements EmailProvider {
  
  
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`MockProviderA: Attempting to send email to ${to}`);
  // Simulate 70% success rate
    
     const success = Math.random() > 0.3;
     if (success) {
       console.log(`MockProviderA: Email sent to ${to}`);
       return true;
     } else {
       console.log(`MockProviderA: Failed to send email to ${to}`);
       return false;
     }
  }

  
}
