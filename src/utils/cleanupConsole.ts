/**
 * Production console cleanup utility
 * Removes console.log calls in production while keeping errors visible
 */

export const initConsoleCleanup = () => {
  if (import.meta.env.PROD) {
    // Preserve original methods for errors
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    
    // Keep warnings and errors but format them better
    console.warn = (...args: unknown[]) => {
      originalWarn('[Warning]', ...args);
    };
    
    console.error = (...args: unknown[]) => {
      originalError('[Error]', ...args);
    };
  }
};
