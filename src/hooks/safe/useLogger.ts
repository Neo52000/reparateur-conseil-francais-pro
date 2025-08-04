// Hook de logging pour traquer les erreurs dans l'application
import { useCallback } from 'react';

interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEvent[] = [];
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(level: LogEvent['level'], message: string, data?: any, component?: string) {
    const event: LogEvent = {
      level,
      message,
      data,
      component,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(event);
    
    // Garder seulement les 1000 derniers logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Log dans la console aussi
    const consoleMethod = level === 'error' ? console.error : 
                         level === 'warn' ? console.warn : 
                         level === 'debug' ? console.debug : console.log;
    
    consoleMethod(`[${component || 'App'}] ${message}`, data || '');
  }

  getLogs(): LogEvent[] {
    return [...this.logs];
  }

  getErrorLogs(): LogEvent[] {
    return this.logs.filter(log => log.level === 'error');
  }

  clearLogs() {
    this.logs = [];
  }
}

export const useLogger = (componentName?: string) => {
  const logger = Logger.getInstance();

  const logInfo = useCallback((message: string, data?: any) => {
    logger.log('info', message, data, componentName);
  }, [componentName]);

  const logWarn = useCallback((message: string, data?: any) => {
    logger.log('warn', message, data, componentName);
  }, [componentName]);

  const logError = useCallback((message: string, data?: any) => {
    logger.log('error', message, data, componentName);
  }, [componentName]);

  const logDebug = useCallback((message: string, data?: any) => {
    logger.log('debug', message, data, componentName);
  }, [componentName]);

  return {
    logInfo,
    logWarn,
    logError,
    logDebug,
    getLogs: () => logger.getLogs(),
    getErrorLogs: () => logger.getErrorLogs(),
    clearLogs: () => logger.clearLogs()
  };
};