import { EventSourcedEntity } from './EventSourcedEntity';
import {
  DomainMessage,
  DomainEventStream,
  SimpleDomainEventStream,
  DomainEvent,
} from '../Domain';
import { Identity } from '../Identity';

export interface EventSourcedAggregateRootConstructor<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {
  new(id: Identity): T;
}

export class EventSourcedAggregateRoot extends EventSourcedEntity {

  private playhead = -1;
  private uncommittedEvents: DomainMessage[] = [];

  constructor(public readonly aggregateId: Identity) {
    super(null as any);
  }

  public getAggregateRootId(): Identity {
    return this.aggregateId;
  }

  public getUncommittedEvents(): DomainEventStream {
    const stream = SimpleDomainEventStream.of(this.uncommittedEvents);
    this.uncommittedEvents = [];
    return stream;
  }

  /**
   * Initializes the aggregate using the given "history" of events.
   */
  public async initializeState(stream: DomainEventStream) {
    await stream.forEach(message => {
      this.playhead += 1;
      this.handleRecursively(message.payload);
    });
  }

  protected apply(event: DomainEvent) {
    this.handleRecursively(event);
    this.playhead += 1;
    this.uncommittedEvents.push(DomainMessage.recordNow(
      this.aggregateId,
      this.playhead,
      event,
    ));
  }

  protected handleRecursively(event: DomainEvent) {
    super.handleRecursively(event, this as any);
  }

}
