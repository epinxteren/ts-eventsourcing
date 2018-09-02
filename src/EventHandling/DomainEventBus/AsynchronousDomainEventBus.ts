/**
 * Simple synchronous publishing of events.
 */
import { DomainEventBus } from '../DomainEventBus';
import { EventListener } from '../EventListener';
import { DomainEventStream, DomainMessage } from '../../Domain';
import { allHandleDomainEventMetadata, DomainEventHandlerMetadata } from '../HandleDomainEvent';
import { ClassUtil } from '../../ClassUtil';
import { Subject, Observable, Subscription } from 'rxjs';

/**
 * Always passes all events in sequence to the event corresponding handlers.
 *
 * TODO: extract handler binding from this class.
 */
export class AsynchronousDomainEventBus implements DomainEventBus {
  private queue: DomainEventStream[] = [];
  private isProcessing: boolean = false;
  private activeStreamSubscription: Subscription | null = null;
  private eventHandlersMappedByEvent: { [eventName: string]: Array<(domainMessage: DomainMessage) => Promise<void>> } = {};
  /* For keeping track if the bus is handling events or not. */
  private isProcessingSubject = new Subject<boolean>();

  constructor(private errorHandler?: (error: any) => void) {

  }

  /**
   * Subscribe an eventLister.
   *
   * @param {EventListener} eventListener
   */
  public subscribe(eventListener: EventListener): void {
    const handlers = allHandleDomainEventMetadata(eventListener);
    handlers.forEach((metadata) => {
      const eventName: string = ClassUtil.nameOffConstructor(metadata.event);
      if (!this.eventHandlersMappedByEvent[eventName]) {
        this.eventHandlersMappedByEvent[eventName] = [];
      }
      this.eventHandlersMappedByEvent[eventName].push(this.createCallbackFunction(eventListener, metadata));
    });
  }

  /**
   * Knows when everything is handled.
   */
  public untilIdle(): Promise<void> {
    return Observable.of(this.isProcessing)
                     .concat(this.isProcessingSubject)
                     .first((processing) => !processing)
                     .toPromise().then(() => undefined);
  }

  public publish(stream: DomainEventStream): void {
    if (this.isProcessing) {
      this.queue.push(stream);
      return;
    }
    this.isProcessing = true;
    this.isProcessingSubject.next(true);
    this.subscribeToNextStream(stream);
  }

  /**
   * Passes the event to the correct argument index of event listener.
   */
  private createCallbackFunction(handler: EventListener, metadata: DomainEventHandlerMetadata): (domainMessage: DomainMessage) => Promise<void> {
    const callback = (handler as any)[metadata.functionName].bind(handler);
    if (metadata.eventArgumentIndex === 0) {
      return (domainMessage: DomainMessage) => {
        return Promise.resolve(callback(domainMessage.payload, domainMessage));
      };
    }
    return (domainMessage: DomainMessage) => {
      return Promise.resolve(callback(domainMessage, domainMessage.payload));
    };
  }

  private onComplete = () => {
    if (this.activeStreamSubscription) {
      this.activeStreamSubscription.unsubscribe();
    }
    const stream = this.queue.pop();
    if (!stream) {
      // no stream to process, we are done!.
      this.activeStreamSubscription = null;
      this.isProcessing = false;
      this.isProcessingSubject.next(false);
      return;
    }
    this.subscribeToNextStream(stream);
  };

  private subscribeToNextStream(stream: DomainEventStream) {
    const handledStream: Observable<any> = stream.concatMap((message: DomainMessage) => {
      const eventName: string = ClassUtil.nameOffInstance(message.payload);
      const handlers = this.eventHandlersMappedByEvent[eventName];
      if (!handlers) {
        return Observable.empty();
      }
      return Observable.fromPromise(Promise.all(handlers.map((handler) => handler(message))));
    });
    this.activeStreamSubscription = handledStream.subscribe(undefined, this.errorHandler, this.onComplete);
  }

}
