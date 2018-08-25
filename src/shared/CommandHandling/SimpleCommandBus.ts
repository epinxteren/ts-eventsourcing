import { CommandHandler } from './CommandHandler';
import { CommandBus } from './CommandBus';
import { getHandleCommandMetadata } from './HandleCommand';
import { CommandHandlerAlreadyRegisteredError, CommandHandlerNotRegisteredError } from './Error';
import { ClassUtil } from '../ClassUtil';
import { Command } from './Command';

/**
 * Only support only one handler for each command.
 */
export class SimpleCommandBus implements CommandBus {

  /**
   * Map of command names with handler.
   */
  private handlers: { [commandName: string]: (command: Command) => void } = {};

  /**
   * Dispatches the command command to the proper CommandHandler.
   */
  public dispatch(command: Command): void {
    const commandName = ClassUtil.nameOffInstance(command);
    const handler = this.handlers[commandName];
    if (!handler) {
      throw CommandHandlerNotRegisteredError.missingHandler(command);
    }
    handler(command);
  }

  /**
   * Subscribes the command handler to this CommandBus.
   */
  public subscribe(handler: CommandHandler): void {
    const handlers = getHandleCommandMetadata(handler);
    for (let metadata of handlers) {
      const commandName = ClassUtil.nameOffConstructor(metadata.command);
      if (this.handlers[commandName]) {
        throw CommandHandlerAlreadyRegisteredError.alreadyRegistered(handler, metadata.functionName, metadata.command);
      }
      this.handlers[commandName] = (handler as any)[metadata.functionName].bind(handler);
    }
  }
}
