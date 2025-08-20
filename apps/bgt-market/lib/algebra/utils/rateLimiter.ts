interface RateLimiterOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // Minimum 100ms between requests
  
  private options: Required<RateLimiterOptions> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  };

  constructor(options?: RateLimiterOptions) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        let retries = 0;
        let delay = this.options.initialDelay;

        while (retries <= this.options.maxRetries) {
          try {
            // Ensure minimum interval between requests
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            if (timeSinceLastRequest < this.minRequestInterval) {
              await this.sleep(this.minRequestInterval - timeSinceLastRequest);
            }
            
            this.lastRequestTime = Date.now();
            const result = await fn();
            resolve(result);
            return;
          } catch (error: any) {
            // Check if it's a rate limit error
            if (error?.response?.status === 429 || error?.message?.includes('429')) {
              retries++;
              if (retries > this.options.maxRetries) {
                reject(new Error(`Rate limited after ${this.options.maxRetries} retries`));
                return;
              }
              
              console.log(`Rate limited, retrying in ${delay}ms (attempt ${retries}/${this.options.maxRetries})`);
              await this.sleep(delay);
              delay = Math.min(delay * this.options.backoffMultiplier, this.options.maxDelay);
            } else {
              // Not a rate limit error, reject immediately
              reject(error);
              return;
            }
          }
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
      }
    }
    
    this.processing = false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for GraphQL requests
export const graphQLRateLimiter = new RateLimiter({
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 15000,
  backoffMultiplier: 2.5,
});