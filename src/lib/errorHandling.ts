import { toast } from 'sonner';

// Production-safe error logger
export function logError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[${context}]`, errorMessage, errorStack);
  
  // In production, you could send this to a logging service
  if (import.meta.env.PROD) {
    // Example: Send to error tracking service
    // sendToErrorTracker({ context, message: errorMessage, stack: errorStack });
  }
}

// User-friendly error messages
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    // Map technical errors to user-friendly messages
    if (error.message.includes('fetch')) {
      return 'Connection error. Please check your internet connection.';
    }
    if (error.message.includes('auth')) {
      return 'Authentication error. Please log in again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('Rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.message.includes('credits')) {
      return 'AI service unavailable. Please contact support.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Toast error notification
export function showError(error: unknown, context?: string) {
  const message = getUserFriendlyMessage(error);
  toast.error(message, { duration: 4000 });
  
  if (context) {
    logError(error, context);
  }
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorContext: string,
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logError(error, errorContext);
    showError(error, errorContext);
    return fallbackValue;
  }
}

// Retry logic for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        console.log(`Retry attempt ${attempt}/${maxRetries}`);
      }
    }
  }
  
  throw lastError;
}

// Validate API response
export function validateApiResponse(response: Response): void {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission.');
    }
    if (response.status === 404) {
      throw new Error('Resource not found.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(`Request failed with status ${response.status}`);
  }
}
