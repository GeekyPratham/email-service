// Simple rate limiter using a sliding window approach
export class RateLimiter {
  private requests: number[] = []; // Timestamps of requests
  private limit: number; // Max requests allowed
  private windowMs: number; // Time window in milliseconds

  constructor(limit: number = 10, windowMs: number = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  // Check if a new request is allowed within the rate limit
  isAllowed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    if (this.requests.length >= this.limit) {
      return false;
    }
    this.requests.push(now);
    return true;
  }
}
