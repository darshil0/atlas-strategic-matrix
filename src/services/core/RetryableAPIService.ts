import { SYSTEM_CONSTANTS } from "@config";

/**
 * Base service with retry logic and exponential backoff
 */
export class RetryableAPIService {
  protected static readonly MAX_RETRIES = SYSTEM_CONSTANTS.DEFAULT_RETRY_COUNT;
  protected static readonly INITIAL_BACKOFF = SYSTEM_CONSTANTS.INITIAL_BACKOFF_MS;

  protected async withRetry<T>(
    operation: () => Promise<T>,
    retryCount = RetryableAPIService.MAX_RETRIES
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < retryCount && this.shouldRetry(error)) {
          const backoff = RetryableAPIService.INITIAL_BACKOFF * Math.pow(2, attempt);
          console.warn(`[RetryableAPIService] Attempt ${attempt + 1} failed, retrying in ${backoff}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        break;
      }
    }
    throw lastError;
  }

  protected shouldRetry(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    // Retry on network errors or 5xx/429
    if (
      message.includes("429") ||
      /5\d{2}/.test(message) ||
      message.includes("Network") ||
      message.includes("Service Unavailable") ||
      message.includes("Internal Server Error")
    ) {
      return true;
    }
    return false;
  }

  protected async inBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((item) =>
          processor(item).catch((error) => {
            console.error("[RetryableAPIService] Batch item failed:", error);
            throw error;
          })
        )
      );
      results.push(...batchResults);
    }
    return results;
  }
}
