import 'reflect-metadata';
import { CommandConstructor } from './Command';
import { CommandHandler, CommandHandlerConstructor } from './CommandHandler';
import { Metadata } from '../Metadata';
import { IncorrectCommandHandlerError } from './Error/IncorrectCommandHandlerError';

const COMMAND_HANDLERS = Symbol.for('command_handlers');

export interface CommandHandlerMetadata {
  functionName: string;
  command: CommandConstructor;
}

export function getHandleCommandMetadata(target: CommandHandler): CommandHandlerMetadata[] {
  const metadata = Metadata.getMetadata(COMMAND_HANDLERS, target.constructor);
  if (!metadata) {
    throw IncorrectCommandHandlerError.missingHandler(target);
  }
  return metadata;
}

export function HandleCommand(target: any, key: string): void {
  const types = Reflect.getMetadata('design:paramtypes', target, key);
  const constructor = target.constructor as CommandHandlerConstructor;
  let handlers = Metadata.getMetadata(COMMAND_HANDLERS, constructor);
  handlers = handlers ? handlers : [];

  if (types.length !== 1) {
    throw IncorrectCommandHandlerError.missingArgument(constructor, key);
  }

  handlers.push({
    functionName: key,
    command: types[0],
  });

  Metadata.defineMetadata(COMMAND_HANDLERS, handlers, constructor);
}
