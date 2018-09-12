import { ClassUtil } from '../../ClassUtil';
import { CommandHandler, CommandHandlerConstructor } from '../CommandHandler';

export class IncorrectCommandHandlerError extends Error {

  public static missingArgument(commandHandler: CommandHandlerConstructor, functionName: string) {
    const commandHandlerName = ClassUtil.nameOffInstance(commandHandler);
    return new this(`Missing command argument on ${commandHandlerName}.${functionName}`);
  }

  public static missingHandler(commandHandler: CommandHandler) {
    const commandHandlerName = ClassUtil.nameOffInstance(commandHandler);
    return new this(`Missing a command handler on ${commandHandlerName}. Don't forget @HandleCommand annotation`);
  }

}
