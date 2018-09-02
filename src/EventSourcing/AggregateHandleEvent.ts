import 'reflect-metadata';
import { DomainEventConstructor } from '../Domain';
import { EventSourcedEntity } from './EventSourcedEntity';
import { IncorrectEventHandlerError } from './Error/IncorrectEventHandlerError';
import { EventListenerConstructor } from '../EventHandling';

const EVENT_HANDLER_FUNCTIONS = 'event_sourced_entity:event:handler:functions';

export interface EventHandlerMetadata {
  functionName: string;
  event: DomainEventConstructor<any>;
}

export function allAggregateEventHandlersMetadata(target: EventSourcedEntity): EventHandlerMetadata[] {
  const metadata = Reflect.getMetadata(EVENT_HANDLER_FUNCTIONS, target.constructor);
  return metadata ? metadata : [];
}

export function AggregateHandleEvent(target: { constructor: EventListenerConstructor } | any, functionName: string): void {
  const constructor = target.constructor;
  const types = Reflect.getMetadata('design:paramtypes', target, functionName);
  let handlers: EventHandlerMetadata[] = Reflect.getMetadata(EVENT_HANDLER_FUNCTIONS, constructor);
  handlers = handlers ? handlers : [];

  if (types.length !== 1) {
    throw IncorrectEventHandlerError.missingArgument(constructor, functionName);
  }

  handlers.push({
    functionName,
    event: types[0],
  });

  Reflect.defineMetadata(EVENT_HANDLER_FUNCTIONS, handlers, constructor);
}
