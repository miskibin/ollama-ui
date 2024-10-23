// loggerService.ts
import winston from "winston";

const createLogger = (verbose: boolean) => {
  const logFormat = winston.format.combine(
    winston.format.colorize({ all: true }), // Color the whole message
    winston.format.printf(({ level, message, requestId, ...meta }) => {
      const reqId = requestId ? `[${requestId}] ` : "";

      // Simplified meta handling
      const metaStr = Object.keys(meta).length
        ? "\n  " + JSON.stringify(meta, null, 2).split("\n").join("\n  ") // Simple indentation
        : "";

      return `${reqId}${message}${metaStr}`;
    })
  );

  return winston.createLogger({
    level: verbose ? "debug" : "info",
    format: logFormat,
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: "error.log",
        level: "error",
      }),
      new winston.transports.File({
        filename: "combined.log",
      }),
    ],
  });
};

export class LoggerService {
  private logger: winston.Logger;
  private requestCounter: number = 0;

  constructor(verbose: boolean = true) {
    this.logger = createLogger(verbose);
  }

  private getRequestId(): string {
    this.requestCounter++;
    return `req_${this.requestCounter.toString().padStart(4, "0")}`;
  }

  private logWithContext(
    level: string,
    message: string,
    meta?: Record<string, any>
  ) {
    const requestId = this.getRequestId();
    this.logger.log(level, message, { ...meta, requestId });
  }

  info(message: string, meta?: Record<string, any>) {
    this.logWithContext("info", message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logWithContext("warn", message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logWithContext("error", message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logWithContext("debug", message, meta);
  }
}
