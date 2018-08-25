import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { Identity } from '../Identity';

export interface EventSourcingRepositoryInterface<AggregateClass extends EventSourcedAggregateRoot> {

  load(id: Identity): Promise<AggregateClass>;

  save(aggregate: AggregateClass): Promise<void>;

}
