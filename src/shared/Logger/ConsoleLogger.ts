import { LoggerInterface, LogLevel } from './LoggerInterface';
import { AbstractLogger } from './AbstractLogger';

export class ConsoleLogger extends AbstractLogger implements LoggerInterface  {

  constructor(private readonly console: Console) {
    super();
  }

  public log(type: LogLevel, ...message: any[]): void {
    const console: any = this.console;
    console[LogLevel[type]].apply(console, message);
  }

}
