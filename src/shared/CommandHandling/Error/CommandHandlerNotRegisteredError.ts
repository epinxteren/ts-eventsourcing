import { Command } from '../Command';
import { ClassUtil } from '../../ClassUtil';

export class CommandHandlerNotRegisteredError extends Error {

  public static missingHandler(command: Command) {
    const commandName = ClassUtil.nameOffInstance(command);
    return new this(`Missing command handler registered for ${commandName}`);
  }

}
