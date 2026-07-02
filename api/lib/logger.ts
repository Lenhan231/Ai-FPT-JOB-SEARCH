import winston from 'winston';
import path from 'path';

const logDir = 'logs';

const { combine, timestamp, printf, json, colorize } = winston.format;

// Custom format for human-readable console logging in development
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (metadata && Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Build transports list.
// In production/cloud environments (like Vercel), we must log to console.
// We only write to files if process.env.DISABLE_FILE_LOGGING is not set.
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? combine(timestamp(), json())
      : combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          consoleFormat
        )
  })
];

// Add file logging only if not in serverless/Vercel environments
const isServerless = process.env.VERCEL || process.env.NOW_BUILDER || process.env.NODE_ENV === 'production';
if (!isServerless) {
  try {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: combine(timestamp(), json())
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log'),
        format: combine(timestamp(), json())
      })
    );
  } catch (error) {
    console.warn("Failed to initialize file logging:", error);
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports
});

export default logger;
