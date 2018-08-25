import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { EventSourcedAggregateFactory } from '../EventSourcedAggregateFactory';
import { Identity } from '../../Identity';
import { DomainEventStream } from '../../Domain';

export class SimpleEventSourcedAggregateFactory<AggregateClass extends EventSourcedAggregateRoot> implements EventSourcedAggregateFactory<AggregateClass> {

  constructor(private readonly aggregate: new (id: Identity) => AggregateClass) {

  }

  public async create(id: Identity, events: DomainEventStream): Promise<AggregateClass> {
    const aggregate = new this.aggregate(id);
    await aggregate.initializeState(events);
    return aggregate;
  }

}
