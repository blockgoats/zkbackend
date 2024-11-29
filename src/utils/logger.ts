export const logger = {
  info: (message: string, meta?: object) => {
    console.log(`[INFO] ${message}`, meta || '');
  },
  error: (message: string, meta?: object) => {
    console.error(`[ERROR] ${message}`, meta || '');
  },
  warn: (message: string, meta?: object) => {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  debug: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }
};