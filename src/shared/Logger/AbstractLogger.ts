import { LoggerInterface, LogLevel } from './LoggerInterface';

export abstract class AbstractLogger implements LoggerInterface {
  public debug(...message: any[]) {
    this.log(LogLevel.debug, ...message);
  }

  public info(...message: any[]) {
    this.log(LogLevel.info, ...message);
  }

  public warn(...message: any[]) {
    this.log(LogLevel.warn, ...message);
  }

  public error(...message: any[]) {
    this.log(LogLevel.error, ...message);
  }

  public abstract log(type: LogLevel, ...message: any[]): void;
}
