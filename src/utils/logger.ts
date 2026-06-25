/**
 * Centralized logging utility
 * Only logs in development mode to avoid console pollution in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDebugEnabled = import.meta.env.VITE_DEBUG === 'true';

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getEmoji(level);
    const prefix = `${emoji} [${level.toUpperCase()}] ${timestamp}`;
    return data ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) return false;
    if (level === 'debug' && !this.isDebugEnabled) return false;
    return true;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), data || '');
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '');
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  // Group logging for complex operations
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(`🔽 ${label}`);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

export const logger = new Logger();

// Convenience exports for common patterns
export const debugLog = (message: string, data?: unknown) => logger.debug(message, data);
export const infoLog = (message: string, data?: unknown) => logger.info(message, data);
export const warnLog = (message: string, data?: unknown) => logger.warn(message, data);
export const errorLog = (message: string, error?: unknown) => logger.error(message, error);