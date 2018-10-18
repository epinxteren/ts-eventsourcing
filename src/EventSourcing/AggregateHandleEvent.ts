import 'reflect-metadata';
import { EventSourcedEntity } from './EventSourcedEntity';
import { IncorrectEventHandlerError } from './Error/IncorrectEventHandlerError';
import { Metadata } from '../Metadata';
import { DomainEvent, DomainEventConstructor } from '../Domain/DomainEvent';
import { EventListenerConstructor } from '../EventHandling/EventListener';

const AGGREGATE_EVENT_HANDLER = Symbol.for('aggregate_handler');

export interface EventHandlerMetadata {
  functionName: string;
  event: DomainEventConstructor<any>;
}

export function getAggregateEventHandler(target: EventSourcedEntity, event: DomainEvent): string | null {
  const metadata: EventHandlerMetadata[] | undefined = Metadata.getMetadata(AGGREGATE_EVENT_HANDLER, target.constructor);
  if (!metadata) {
    return null;
  }
  const found = metadata.find((eventHandlerMetadata) => {
    return eventHandlerMetadata.event === event.constructor;
  });
  return found ? found.functionName : null;
}

export function allAggregateEventHandlersMetadata(target: EventSourcedEntity): EventHandlerMetadata[] {
  const metadata = Metadata.getMetadata(AGGREGATE_EVENT_HANDLER, target.constructor);
  return metadata ? metadata : [];
}

export function AggregateHandleEvent(target: { constructor: EventListenerConstructor } | any, functionName: string): void {
  const constructor = target.constructor;
  const types = Reflect.getMetadata('design:paramtypes', target, functionName);
  let handlers: EventHandlerMetadata[] = Metadata.getMetadata(AGGREGATE_EVENT_HANDLER, constructor);
  handlers = handlers ? handlers : [];

  if (types.length !== 1) {
    throw IncorrectEventHandlerError.missingArgument(constructor, functionName);
  }

  handlers.push({
    functionName,
    event: types[0],
  });

  Metadata.defineMetadata(AGGREGATE_EVENT_HANDLER, handlers, constructor);
}
