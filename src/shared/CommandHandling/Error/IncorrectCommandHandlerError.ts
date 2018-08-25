import { ClassUtil } from '../../ClassUtil';
import { CommandHandlerConstructor } from '../CommandHandler';

export class IncorrectCommandHandlerError extends Error {

  public static missingArgument(commandHandler: CommandHandlerConstructor, functionName: string) {
    const commandHandlerName = ClassUtil.nameOffInstance(commandHandler);
    return new this(`Missing command argument on ${commandHandlerName}.${functionName}`);
  }

}
