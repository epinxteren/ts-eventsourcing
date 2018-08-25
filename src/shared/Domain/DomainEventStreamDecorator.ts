import { EventSourcedAggregateRoot } from '../EventSourcing';
import { DomainEventStream } from './DomainEventStream';

export interface DomainEventStreamDecorator {
  decorate(aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream;
}
