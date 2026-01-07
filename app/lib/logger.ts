/**
 * Logger Utility
 * 
 * Environment-aware logging utility that suppresses debug logs in production
 * while maintaining error and warning visibility.
 * 
 * @module logger
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log informational messages (only in development)
   * @param message - The log message
   * @param args - Additional arguments to log
   */
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`[INFO] ${message}`, ...args);
  },

  /**
   * Log debug messages (only in development)
   * @param message - The debug message
   * @param args - Additional arguments to log
   */
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.log(`[DEBUG] ${message}`, ...args);
  },

  /**
   * Log warning messages (always logged)
   * @param message - The warning message
   * @param args - Additional arguments to log
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Log error messages (always logged)
   * @param message - The error message
   * @param args - Additional arguments to log
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${message}`, ...args);
    // TODO: Send to monitoring service in production (e.g., Sentry, DataDog)
  },
};
