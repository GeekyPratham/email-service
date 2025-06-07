// Circuit breaker to handle repeated failures
export class CircuitBreaker {
  private failureCount: number = 0;
  private failureThreshold: number = 5; // Open circuit after 5 failures
  private timeoutMs: number = 30_000; // Reset after 30 seconds
  private isOpen: boolean = false;
  private lastFailureTime: number = 0;

  // Check if the circuit is available for use
  isAvailable(): boolean {
    if (this.isOpen && Date.now() - this.lastFailureTime > this.timeoutMs) {
      this.isOpen = false;
      this.failureCount = 0; // Reset on timeout
    }
    return !this.isOpen;
  }

  // Record a failure and update circuit state
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.isOpen = true;
    }
  }

  // Record a success and reset failure count
  recordSuccess(): void {
    this.failureCount = 0;
    this.isOpen = false;
  }
}
