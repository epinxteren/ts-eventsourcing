import { CommandConstructor } from '../Command';
import { ClassUtil } from '../../ClassUtil';
import { CommandHandler } from '../CommandHandler';

export class CommandHandlerAlreadyRegisteredError extends Error {

  public static alreadyRegistered(handler: CommandHandler, handlerFunction: string, command: CommandConstructor) {
    const handlerName = ClassUtil.nameOffInstance(handler);
    const commandName = ClassUtil.nameOffInstance(command);
    return new this(
      `${commandName} cannot be registered on ${handlerName}.${handlerFunction} because already registered to other handler`);
  }

}
