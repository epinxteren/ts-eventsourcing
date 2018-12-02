import { ClassUtil } from '../../ClassUtil';
import { EventListener, EventListenerConstructor } from '../EventListener';

export class IncorrectDomainEventHandlerError extends Error {

  public static missingArgument(eventHandler: EventListenerConstructor, functionName: string) {
    const eventHandlerName = ClassUtil.nameOff(eventHandler);
    return new this(`Missing event argument on ${eventHandlerName}.${functionName}`);
  }

  public static toManyArguments(eventHandler: EventListenerConstructor, functionName: string, _types: any[]) {
    const eventHandlerName = ClassUtil.nameOff(eventHandler);
    return new this(`To many arguments for ${eventHandlerName}.${functionName}`);
  }

  public static noHandlers(eventHandler: EventListener) {
    const eventHandlerName = ClassUtil.nameOff(eventHandler);
    return new this(`No handler functions on ${eventHandlerName}`);
  }

  public static specifyOneEvent(eventHandler: EventListenerConstructor, functionName: string) {
    const eventHandlerName = ClassUtil.nameOff(eventHandler);
    return new this(`Specify at least one event (HandleDomainEvent(<Event>)) or don't use it as function (${eventHandlerName}.${functionName})`);
  }
}
