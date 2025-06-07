export interface EmailStatus {
  id: string;
  to: string;
  status: 'pending' | 'sent' | 'failed';
  provider: string;
  timestamp: number;
  error?: string;
}
