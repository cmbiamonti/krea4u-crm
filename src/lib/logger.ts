// src/lib/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  warn: (...args: any[]) => isDev && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // Errori sempre visibili
  info: (...args: any[]) => isDev && console.info(...args),
}