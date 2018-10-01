import { EventSourcedAggregateRoot, EventSourcedAggregateRootConstructor } from '../EventSourcedAggregateRoot';
import { EventSourcedAggregateFactory } from '../EventSourcedAggregateFactory';
import { Identity } from '../../ValueObject/Identity';
import { DomainEventStream } from '../../Domain/DomainEventStream';

export class SimpleEventSourcedAggregateFactory<AggregateClass extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> implements EventSourcedAggregateFactory<AggregateClass, Id> {

  constructor(private readonly aggregate: EventSourcedAggregateRootConstructor<AggregateClass, Id>) {

  }

  public async create(id: Id, events: DomainEventStream): Promise<AggregateClass> {
    const aggregate = new this.aggregate(id);
    await aggregate.initializeState(events);
    return aggregate;
  }

}
