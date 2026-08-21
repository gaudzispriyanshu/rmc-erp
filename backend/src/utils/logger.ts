import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const appLogPath = path.join(LOG_DIR, 'app.log');
const dbLogPath = path.join(LOG_DIR, 'db.log');

// Ensure log files exist immediately upon initialization
if (!fs.existsSync(appLogPath)) {
  fs.writeFileSync(appLogPath, '');
}
if (!fs.existsSync(dbLogPath)) {
  fs.writeFileSync(dbLogPath, '');
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function appendToFile(filePath: string, message: string) {
  fs.appendFile(filePath, message + '\n', (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    const timestamp = formatTimestamp();
    const logLine = `[${timestamp}] [INFO] ${msg} ${args.length ? JSON.stringify(args) : ''}`;
    console.log(logLine);
    appendToFile(appLogPath, logLine);
  },
  warn: (msg: string, ...args: any[]) => {
    const timestamp = formatTimestamp();
    const logLine = `[${timestamp}] [WARN] ${msg} ${args.length ? JSON.stringify(args) : ''}`;
    console.warn(logLine);
    appendToFile(appLogPath, logLine);
  },
  error: (msg: string, err?: any) => {
    const timestamp = formatTimestamp();
    const errDetail = err?.stack || err?.message || err || '';
    const logLine = `[${timestamp}] [ERROR] ${msg} ${errDetail}`;
    console.error(logLine);
    appendToFile(appLogPath, logLine);
  },
  db: (queryText: string, durationMs?: number, err?: any) => {
    const timestamp = formatTimestamp();
    if (err) {
      const logLine = `[${timestamp}] [DB ERROR] ${queryText} | Error: ${err?.message || err}`;
      console.error(logLine);
      appendToFile(dbLogPath, logLine);
    } else {
      const logLine = `[${timestamp}] [DB QUERY] ${queryText} (${durationMs}ms)`;
      console.log(logLine);
      appendToFile(dbLogPath, logLine);
    }
  }
};
