import { DomainEventStream } from './DomainEventStream';
import { EventSourcedAggregateRoot } from '../EventSourcing/EventSourcedAggregateRoot';

export interface DomainEventStreamDecorator {
  decorate(aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream;
}
