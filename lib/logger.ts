/**
 * Logging utility for consistent error handling and debugging
 */

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let log = `[${timestamp}] [${level}] ${message}`;
    
    if (context) {
      log += ` ${JSON.stringify(context)}`;
    }
    
    if (error) {
      log += ` ${error.message}`;
      if (this.isDevelopment && error.stack) {
        log += `\n${error.stack}`;
      }
    }
    
    return log;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    console.error(this.formatLog(entry));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    console.warn(this.formatLog(entry));
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    console.log(this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      console.debug(this.formatLog(entry));
    }
  }

  /**
   * Log API request information
   */
  logApiRequest(method: string, path: string, context?: Record<string, unknown>): void {
    this.info(`${method} ${path}`, context);
  }

  /**
   * Log API error
   */
  logApiError(method: string, path: string, error: Error, context?: Record<string, unknown>): void {
    this.error(`${method} ${path} failed`, error, context);
  }

  /**
   * Log rate limit hit
   */
  logRateLimit(identifier: string, endpoint: string): void {
    this.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`);
  }
}

export const logger = new Logger();
