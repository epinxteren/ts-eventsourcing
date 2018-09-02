import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { Identity } from '../Identity';

export interface EventSourcingRepositoryInterface<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {

  load(id: Identity): Promise<T>;

  save(aggregate: T): Promise<void>;

}
