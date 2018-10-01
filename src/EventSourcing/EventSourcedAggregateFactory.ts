import { Identity } from '../ValueObject/Identity';
import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { DomainEventStream } from '../Domain/DomainEventStream';

export interface EventSourcedAggregateFactory<AggregateClass extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> {

  create(id: Id, events: DomainEventStream): Promise<AggregateClass>;

}
