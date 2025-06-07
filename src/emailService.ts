// Core email service handling sending logic with retries, fallbacks, and status tracking
import { EmailProvider } from './interfaces/EmailProvider';
import { EmailStatus } from './interfaces/EmailStatus';
import { RateLimiter } from './rateLimiter';
import { CircuitBreaker } from './circuitBreaker';
import { Logger } from './logger';

export class EmailService {
  private primaryProvider: EmailProvider;
  private fallbackProvider: EmailProvider;
  private rateLimiter: RateLimiter;
  private circuitBreaker: CircuitBreaker;
  private logger: Logger;
  private sentEmails: Set<string> = new Set(); // For idempotency
  private statuses: EmailStatus[] = []; // Track email statuses

  constructor(primary: EmailProvider, fallback: EmailProvider) {
    this.primaryProvider = primary;
    this.fallbackProvider = fallback;
    this.rateLimiter = new RateLimiter(10, 60_000); // 10 emails per minute
    this.circuitBreaker = new CircuitBreaker();
    this.logger = new Logger();
  }

  // Retry logic with exponential backoff
  private async retryWithBackoff(
    fn: () => Promise<boolean>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<boolean> {
    let attempt = 1;
    while (attempt <= maxRetries) {
      try {
        const result = await fn();
        if (result) return true;
        throw new Error('Send failed');
      } catch (error) {
        if (attempt === maxRetries) throw error;
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        this.logger.log(`Retry ${attempt}/${maxRetries} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      }
    }
    return false;
  }

  // Send email with all features integrated
  async sendEmail(to: string, subject: string, body: string, idempotencyKey: string): Promise<boolean> {
    // Check idempotency to prevent duplicate sends
    if (this.sentEmails.has(idempotencyKey)) {
      this.logger.log(`Email with key ${idempotencyKey} already sent`);
      return true;
    }

    // Enforce rate limiting
    if (!this.rateLimiter.isAllowed()) {
      this.logger.log('Rate limit exceeded');
      throw new Error('Rate limit exceeded');
    }

    // Initialize status tracking
    const status: EmailStatus = {
      id: idempotencyKey,
      to,
      status: 'pending',
      provider: '',
      timestamp: Date.now(),
    };
    this.statuses.push(status);

    try {
      let result = false;
      let providerUsed = '';

      // Try primary provider if circuit is closed
      if (this.circuitBreaker.isAvailable()) {
        providerUsed = 'primary';
        this.logger.log(`Attempting to send email to ${to} with primary provider`);
        try {
          result = await this.retryWithBackoff(() => this.primaryProvider.sendEmail(to, subject, body));
          if (result) {
            this.circuitBreaker.recordSuccess();
          } else {
            this.circuitBreaker.recordFailure();
          }
        } catch (error) {
          this.circuitBreaker.recordFailure();
          this.logger.log(`Primary provider failed with error: ${(error instanceof Error) ? error.message : String(error)}`);
          result = false; // Ensure fallback is triggered
        }
      }

      // If primary fails or circuit is open, use fallback
      if (!result) {
        providerUsed = 'fallback';
        this.logger.log(`Primary provider failed or circuit open, using fallback provider for ${to}`);
        result = await this.retryWithBackoff(() => this.fallbackProvider.sendEmail(to, subject, body));
      }

      // Update status based on result
      status.provider = providerUsed;
      status.status = result ? 'sent' : 'failed';
      if (result) {
        this.sentEmails.add(idempotencyKey);
        this.logger.log(`Email sent to ${to} via ${providerUsed} provider`);
      } else {
        status.error = 'All providers failed';
        this.logger.log(`Failed to send email to ${to}: All providers failed`);
      }
      return result;
    } catch (error) {
      status.status = 'failed';
      status.error = (error instanceof Error) ? error.message : String(error);
      this.logger.log(`Error sending email to ${to}: ${(error instanceof Error) ? error.message : String(error)}`);
      throw error;
    }
  }

  // Retrieve status by idempotency key
  getStatus(id: string): EmailStatus | undefined {
    return this.statuses.find((s) => s.id === id);
  }
}
