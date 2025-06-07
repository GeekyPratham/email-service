// Unit tests for EmailService
import { EmailService } from '../src/emailService';
import { MockProviderA } from '../src/providers/mockProviderA';
import { MockProviderB } from '../src/providers/mockProviderB';

jest.mock('../src/providers/mockProviderA');
jest.mock('../src/providers/mockProviderB');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockProviderA: jest.Mocked<MockProviderA>;
  let mockProviderB: jest.Mocked<MockProviderB>;

  beforeEach(() => {
    mockProviderA = new MockProviderA() as jest.Mocked<MockProviderA>;
    mockProviderB = new MockProviderB() as jest.Mocked<MockProviderB>;
    emailService = new EmailService(mockProviderA, mockProviderB);
    jest.clearAllMocks();
  });

  it('sends email with primary provider on success', async () => {
    mockProviderA.sendEmail.mockResolvedValue(true);
    const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body', 'unique-id-1');
    expect(result).toBe(true);
    expect(mockProviderA.sendEmail).toHaveBeenCalledWith('test@example.com', 'Subject', 'Body');
    expect(mockProviderB.sendEmail).not.toHaveBeenCalled();
  });

  it('retries and falls back to secondary provider on primary failure', async () => {
    mockProviderA.sendEmail.mockResolvedValue(false);
    mockProviderB.sendEmail.mockResolvedValue(true);
    const result = await emailService.sendEmail('test@example.com', 'Subject', 'Body', 'unique-id-2');
    expect(result).toBe(true);
    expect(mockProviderA.sendEmail).toHaveBeenCalledTimes(3); // 3 retries
    expect(mockProviderB.sendEmail).toHaveBeenCalledWith('test@example.com', 'Subject', 'Body');
  });

  it('handles idempotency correctly', async () => {
    mockProviderA.sendEmail.mockResolvedValue(true);
    // TODO: Add assertions to test idempotency logic
  });
});
