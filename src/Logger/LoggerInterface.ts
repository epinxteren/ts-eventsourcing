export enum LogLevel {
  debug,
  info,
  warn,
  error,
}

export interface LoggerInterface {
  debug(...message: any[]): void;

  info(...message: any[]): void;

  warn(...message: any[]): void;

  error(...message: any[]): void;

  log(level: LogLevel, ...message: any[]): void;
}
