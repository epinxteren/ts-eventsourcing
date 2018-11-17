import { LoggerInterface, LogLevel } from './LoggerInterface';
import { AbstractLogger } from './AbstractLogger';

export class PrefixDecoratorLogger extends AbstractLogger implements LoggerInterface {

  public static with(logger: LoggerInterface,
                     prefix: string): LoggerInterface {
    return new this(logger, prefix);
  }

  constructor(private readonly logger: LoggerInterface,
              private readonly prefix: string) {
    super();
  }

  public log(level: LogLevel, ...message: any[]) {
    this.logger.log.apply(this.logger, [level, this.prefix, ...message]);
  }

}
