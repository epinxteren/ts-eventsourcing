import { CommandHandler } from './CommandHandler';
import { CommandBus } from './CommandBus';
import { getHandleCommandMetadata } from './HandleCommand';
import { ClassUtil } from '../ClassUtil';
import { Command } from './Command';
import { CommandHandlerNotRegisteredError } from './Error/CommandHandlerNotRegisteredError';
import { CommandHandlerAlreadyRegisteredError } from './Error/CommandHandlerAlreadyRegisteredError';

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
  public async dispatch(command: Command): Promise<any> {
    const commandName = ClassUtil.nameOffInstance(command);
    const handler = this.handlers[commandName];
    if (!handler) {
      return Promise.reject(CommandHandlerNotRegisteredError.missingHandler(command));
    }
    return await handler(command);
  }

  /**
   * Subscribes the command handler to this CommandBus.
   */
  public subscribe(handler: CommandHandler): void {
    const handlers = getHandleCommandMetadata(handler);
    for (const metadata of handlers) {
      const commandName = ClassUtil.nameOffConstructor(metadata.command);
      if (this.handlers[commandName]) {
        throw CommandHandlerAlreadyRegisteredError.alreadyRegistered(handler, metadata.functionName, metadata.command);
      }
      this.handlers[commandName] = (handler as any)[metadata.functionName].bind(handler);
    }
  }
}
