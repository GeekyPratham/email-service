export interface EmailTask {
  to: string;
  subject: string;
  body: string;
  idempotencyKey: string;
}
