import 'reflect-metadata';
import { EventListener, EventListenerConstructor } from './EventListener';
import { IncorrectDomainEventHandlerError } from './Error/IncorrectDomainEventHandlerError';
import { ClassUtil } from '../ClassUtil';
import { Metadata } from '../Metadata';
import { DomainEventConstructor } from '../Domain/DomainEvent';
import { DomainMessage } from '../Domain/DomainMessage';

const EVENT_HANDLERS = Symbol.for('event_handlers');

export interface DomainEventHandlerMetadata {
  functionName: string;
  event: DomainEventConstructor<any>;
  eventArgumentIndex: number;
}

export function allHandleDomainEventMetadata(target: EventListener): DomainEventHandlerMetadata[] {
  const metadata = Metadata.getMetadata(EVENT_HANDLERS, target.constructor);
  return metadata ? metadata : [];
}

export function HandleDomainEvent(target: { constructor: EventListenerConstructor } | any, functionName: string): void {
  const constructor = target.constructor;
  const types = Reflect.getMetadata('design:paramtypes', target, functionName);
  let handlers: DomainEventHandlerMetadata[] = Metadata.getMetadata(EVENT_HANDLERS, constructor);
  handlers = handlers ? handlers : [];

  if (types.length > 2) {
    throw IncorrectDomainEventHandlerError.toManyArguments(constructor, functionName, types);
  }

  if (types.length === 0) {
    throw IncorrectDomainEventHandlerError.missingArgument(constructor, functionName);
  }

  // We only know the DomainMessage class, event does not have a base class, so we assume that the other variable is the event class.
  const eventArgumentIndex: number = ClassUtil.constructorIsInstanceOf(types[0], DomainMessage) ? 1 : 0;

  handlers.push({
    functionName,
    event: types[eventArgumentIndex],
    eventArgumentIndex,
  });

  Metadata.defineMetadata(EVENT_HANDLERS, handlers, constructor);
}
