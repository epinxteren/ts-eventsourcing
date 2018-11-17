import { LoggerInterface, LogLevel } from './LoggerInterface';
import { AbstractLogger } from './AbstractLogger';
import * as os from 'os';
import Process = NodeJS.Process;

export class ProcessLogger extends AbstractLogger implements LoggerInterface {

  constructor(private readonly process: Process) {
    super();
  }

  public log(type: LogLevel, ...message: any[]): void {
    if (type === LogLevel.error) {
      this.process.stderr.write(message.concat([os.EOL]).join(' '));
      return;
    }
    this.process.stdout.write(message.concat([os.EOL]).join(' '));
  }

}
