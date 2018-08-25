/**
 * Specify the handler by @handleCommand
 */
export interface CommandHandler {

}

export type CommandHandlerConstructor  = new (...args: any[]) => CommandHandler;
