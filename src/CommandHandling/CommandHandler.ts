/**
 * Specify the handler by @handleCommand
 */
export interface CommandHandler {

}

export type CommandHandlerConstructor<Handler = CommandHandler> = new (...args: any[]) => Handler;
