import { Command } from './Command';
import { CommandHandler } from './CommandHandler';

export interface CommandBus {
  /**
   * Dispatches the command command to the proper CommandHandler.
   */
  dispatch(command: Command): void;
  /**
   * Subscribes the command handler to this CommandBus.
   */
  subscribe(handler: CommandHandler): void;
}
