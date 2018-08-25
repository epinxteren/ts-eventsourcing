import { ClassUtil } from '../../ClassUtil';
import { EventListenerConstructor } from '../EventListener';

export class IncorrectDomainEventHandlerError extends Error {

  public static missingArgument(eventHandler: EventListenerConstructor, functionName: string) {
    const eventHandlerName = ClassUtil.nameOffInstance(eventHandler);
    return new this(`Missing event argument on ${eventHandlerName}.${functionName}`);
  }

  static toManyArguments(eventHandler: EventListenerConstructor, functionName: string, _types: any[]) {
    const eventHandlerName = ClassUtil.nameOffInstance(eventHandler);
    return new this(`To many arguments for ${eventHandlerName}.${functionName}`);
  }
}
