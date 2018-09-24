import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { Identity } from '../ValueObject/Identity';

export interface EventSourcingRepositoryInterface<T extends EventSourcedAggregateRoot<Id> = EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> {

  has(id: Id): Promise<boolean>;

  load(id: Id): Promise<T>;

  save(aggregate: T): Promise<void>;

}
