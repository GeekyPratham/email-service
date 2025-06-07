# Resilient Email Service

A TypeScript-based email sending service with retry, fallback, idempotency, rate limiting, and status tracking.

## Setup Instructions

1. **Navigate to the project directory:**
\`\`\`
cd email-service
\`\`\`

2. **Install dependencies:**
\`\`\`
npm install
\`\`\`

3. **Build the project:**
\`\`\`
npm run build
\`\`\`

4. **Run tests:**
\`\`\`
npm run test
\`\`\`

5. **Start the server:**
\`\`\`
npm start
\`\`\`

## API Endpoints

- **POST /send-email**: Queue an email for sending.
  - Body: { "to": "string", "subject": "string", "body": "string", "idempotencyKey": "string" }
  - Example:
\`\`\`
curl -X POST http://localhost:5000/send-email -H "Content-Type: application/json" -d '{"to":"test@example.com","subject":"Test","body":"Hello","idempotencyKey":"unique-id-1"}'
\`\`\`

- **GET /status/:id**: Get the status of an email by its idempotency key.
  - Example:
\`\`\`
curl http://localhost:5000/status/unique-id-1
\`\`\`

**Assumptions**

- Mock providers simulate email sending with random failures (70% success for A, 50% for B).
- Rate limit: 10 emails per minute.
- Retry: 3 attempts with exponential backoff (1s, 2s, 4s).
- In-memory storage for idempotency and status tracking.
- Simple queue system processes emails sequentially.
