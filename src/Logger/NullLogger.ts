import { LogLevel } from './LoggerInterface';
import { AbstractLogger } from './AbstractLogger';

export class NullLogger extends AbstractLogger {
  public log(_type: LogLevel, ..._message: any[]): void {
    // Do nothing.
  }
}
