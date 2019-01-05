import 'reflect-metadata';
import { QueryConstructor } from './Query';
import { QueryHandler, QueryHandlerConstructor } from './QueryHandler';
import { Metadata } from '../Metadata';
import { IncorrectQueryHandlerError } from './Error/IncorrectQueryHandlerError';

const QUERY_HANDLERS = Symbol.for('query_handlers');

export interface QueryHandlerMetadata {
  functionName: string;
  Query: QueryConstructor;
}

export function getHandleQueryMetadata(target: QueryHandler): QueryHandlerMetadata[] {
  const metadata = Metadata.getMetadata(QUERY_HANDLERS, target.constructor);
  if (!metadata) {
    throw IncorrectQueryHandlerError.missingHandler(target);
  }
  return metadata;
}

function HandleQueryByParameterTypes(target: any, key: string): void {
  const types = Reflect.getMetadata('design:paramtypes', target, key);
  const constructor = target.constructor as QueryHandlerConstructor;
  let handlers = Metadata.getMetadata(QUERY_HANDLERS, constructor);
  handlers = handlers ? handlers : [];

  if (types.length !== 1) {
    throw IncorrectQueryHandlerError.missingArgument(constructor, key);
  }

  handlers.push({
    functionName: key,
    Query: types[0],
  });

  Metadata.defineMetadata(QUERY_HANDLERS, handlers, constructor);
}

export function HandleQuery(target: any, functionName: string): void;
export function HandleQuery(...queries: QueryConstructor[]): (target: any, functionName: string) => void;
export function HandleQuery(...args: any[]): ((target: any, functionName: string) => void) | void {
  if (args.length === 0 || typeof args[0] === 'function') {
    return (target: any, functionName: string) => {
      const constructor = target.constructor as QueryHandlerConstructor;
      if (args.length === 0) {
        throw IncorrectQueryHandlerError.missingQuery(constructor, functionName);
      }
      let handlers = Metadata.getMetadata(QUERY_HANDLERS, constructor);
      handlers = handlers ? handlers : [];
      for (const Query of args) {
        handlers.push({
          functionName,
          Query,
        });
      }
      Metadata.defineMetadata(QUERY_HANDLERS, handlers, constructor);
    };
  }
  return HandleQueryByParameterTypes(args[0], args[1]);
}
