import { DomainEventStream } from '../Domain';
import { Identity } from '../Identity';
import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';

export interface EventSourcedAggregateFactory<AggregateClass extends EventSourcedAggregateRoot> {

  create(id: Identity, events: DomainEventStream): Promise<AggregateClass>;

}
