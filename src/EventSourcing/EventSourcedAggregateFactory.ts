import { DomainEventStream } from '../Domain';
import { Identity } from '../ValueObject/Identity';
import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';

export interface EventSourcedAggregateFactory<AggregateClass extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> {

  create(id: Id, events: DomainEventStream): Promise<AggregateClass>;

}
