// packages/logging/src/index.ts
// Structured JSON Logger for Anti-Scam Uzbekistan microservices

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  requestId?: string;
  correlationId?: string;
  timestamp: string;
  message: string;
  duration?: number;
  status?: number;
  path?: string;
  method?: string;
  details?: any;
}

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private emit(level: LogEntry['level'], message: string, meta: Partial<LogEntry> = {}) {
    const entry: LogEntry = {
      level,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      message,
      ...meta,
    };
    // Emit single-line structured JSON as required for production observability & log ingestion
    const output = JSON.stringify(entry);
    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  info(message: string, meta?: Partial<LogEntry>) {
    this.emit('info', message, meta);
  }

  warn(message: string, meta?: Partial<LogEntry>) {
    this.emit('warn', message, meta);
  }

  error(message: string, meta?: Partial<LogEntry>) {
    this.emit('error', message, meta);
  }

  debug(message: string, meta?: Partial<LogEntry>) {
    this.emit('debug', message, meta);
  }

  logRequest(method: string, path: string, status: number, durationMs: number, meta?: Partial<LogEntry>) {
    this.emit(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', `${method} ${path} ${status} (${durationMs}ms)`, {
      method,
      path,
      status,
      duration: durationMs,
      ...meta,
    });
  }
}

export const createLogger = (serviceName: string) => new Logger(serviceName);
