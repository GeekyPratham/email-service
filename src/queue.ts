// Basic in-memory queue for processing email tasks sequentially
import { EmailTask } from './interfaces/EmailTask';

export class Queue {
  private tasks: EmailTask[] = [];
  private isProcessing: boolean = false;
  private processFunction: (task: EmailTask) => Promise<boolean>;

  constructor(processFunction: (task: EmailTask) => Promise<boolean>) {
    this.processFunction = processFunction;
  }

  // Add a task to the queue and start processing if not already doing so
  addTask(task: EmailTask): void {
    this.tasks.push(task);
    if (!this.isProcessing) {
      this.processNext();
    }
  }

  // Process the next task in the queue
  private async processNext(): Promise<void> {
    if (this.tasks.length === 0) {
      this.isProcessing = false;
      return;
    }
    this.isProcessing = true;
    const task = this.tasks.shift()!;
    try {
      const result = await this.processFunction(task);
      console.log(`Processed task for ${task.to}: ${result ? 'success' : 'failure'}`);
    } catch (error) {
      console.error(`Error processing task for ${task.to}:`, error);
    }
    this.processNext();
  }
}
