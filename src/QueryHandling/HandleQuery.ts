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

export function HandleQuery(target: any, key: string): void {
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
