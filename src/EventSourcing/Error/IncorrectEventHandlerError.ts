import { ClassUtil } from '../../ClassUtil';
import { EventSourcedEntityConstructor } from '../EventSourcedEntity';

export class IncorrectEventHandlerError extends Error {

  public static missingArgument(eventHandler: EventSourcedEntityConstructor, functionName: string) {
    const eventHandlerName = ClassUtil.nameOffInstance(eventHandler);
    return new this(`Missing event argument on ${eventHandlerName}.${functionName}`);
  }
}
