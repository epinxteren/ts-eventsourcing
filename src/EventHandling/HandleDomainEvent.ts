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
  event: DomainEventConstructor[];
  eventArgumentIndex: number;
}

export function allHandleDomainEventMetadata(target: EventListener): DomainEventHandlerMetadata[] {
  const metadata = Metadata.getMetadata(EVENT_HANDLERS, target.constructor);
  return metadata ? metadata : [];
}

function HandleDomainEventByParamtypes(target: { constructor: EventListenerConstructor } | any, functionName: string): void {
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

export function HandleDomainEvent(...events: DomainEventConstructor[]): (target: { constructor: EventListenerConstructor } | any, functionName: string) => void;
export function HandleDomainEvent(target: { constructor: EventListenerConstructor } | any, functionName: string): void;
export function HandleDomainEvent(...args: any[]): any {
  if (args.length === 0 || typeof args[0] === 'function') {
    return (target: { constructor: EventListenerConstructor } | any, functionName: string) => {
      const constructor = target.constructor;
      if (args.length === 0) {
        throw IncorrectDomainEventHandlerError.specifyOneEvent(constructor, functionName);
      }
      const types = Reflect.getMetadata('design:paramtypes', target, functionName);
      let handlers: DomainEventHandlerMetadata[] = Metadata.getMetadata(EVENT_HANDLERS, constructor);
      handlers = handlers ? handlers : [];

      // We only know the DomainMessage class, event does not have a base class, so we assume that the other variable is the event class.
      const eventArgumentIndex: number = ClassUtil.constructorIsInstanceOf(types[0], DomainMessage) ? 1 : 0;

      args.forEach((event) => {
        handlers.push({
          functionName,
          event,
          eventArgumentIndex,
        });
      });
      Metadata.defineMetadata(EVENT_HANDLERS, handlers, constructor);
    };
  }
  return HandleDomainEventByParamtypes(args[0], args[1]);
}
