// Centralized logging utility for edge functions with PII redaction

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogContext {
  function: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

// PII fields to redact
const PII_FIELDS = ['email', 'phone', 'full_name', 'password', 'token', 'api_key'];

// Redact PII from objects
function redactPII(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => redactPII(item));
  }
  
  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (PII_FIELDS.some(field => lowerKey.includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactPII(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export class Logger {
  private context: LogContext;
  
  constructor(context: LogContext) {
    this.context = context;
  }
  
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      function: this.context.function,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      requestId: this.context.requestId,
      message,
      data: data ? redactPII(data) : undefined
    };
    
    const prefix = `[${timestamp}] [${level}] [${this.context.function}]`;
    
    if (level === 'ERROR') {
      console.error(prefix, message, data ? JSON.stringify(logEntry.data, null, 2) : '');
    } else if (level === 'WARN') {
      console.warn(prefix, message, data ? JSON.stringify(logEntry.data, null, 2) : '');
    } else {
      console.log(prefix, message, data ? JSON.stringify(logEntry.data, null, 2) : '');
    }
    
    return logEntry;
  }
  
  info(message: string, data?: any) {
    return this.log('INFO', message, data);
  }
  
  warn(message: string, data?: any) {
    return this.log('WARN', message, data);
  }
  
  error(message: string, error?: any, data?: any) {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    return this.log('ERROR', message, errorData);
  }
  
  debug(message: string, data?: any) {
    return this.log('DEBUG', message, data);
  }
  
  // Request/Response logging
  logRequest(method: string, endpoint: string, payload?: any) {
    return this.info(`${method} ${endpoint}`, { 
      request: {
        method,
        endpoint,
        payload: redactPII(payload)
      }
    });
  }
  
  logResponse(statusCode: number, data?: any, duration?: number) {
    return this.info(`Response ${statusCode}`, {
      response: {
        statusCode,
        data: redactPII(data),
        durationMs: duration
      }
    });
  }
  
  // Specific logging for quiz flow
  logQuizGeneration(profile: any, result: { success: boolean; count?: number; error?: string }) {
    return this.info('Quiz Generation', {
      profile: redactPII(profile),
      result
    });
  }
  
  logAnswerSubmission(questionId: string, response: any, saved: boolean) {
    return this.info('Answer Submission', {
      questionId,
      response: redactPII(response),
      saved
    });
  }
  
  logRecommendationGeneration(sessionId: string, result: { success: boolean; count?: number; error?: string }) {
    return this.info('Recommendation Generation', {
      sessionId,
      result
    });
  }
  
  logCollegeFetch(filters: any, resultCount: number) {
    return this.info('College Fetch', {
      filters,
      resultCount
    });
  }
}

// Helper to create logger with request context
export function createLogger(functionName: string, req?: Request): Logger {
  const requestId = req?.headers.get('x-request-id') || crypto.randomUUID();
  return new Logger({
    function: functionName,
    requestId
  });
}
