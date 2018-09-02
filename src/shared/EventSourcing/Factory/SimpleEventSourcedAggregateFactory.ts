import { EventSourcedAggregateRoot, EventSourcedAggregateRootConstructor } from '../EventSourcedAggregateRoot';
import { EventSourcedAggregateFactory } from '../EventSourcedAggregateFactory';
import { Identity } from '../../Identity';
import { DomainEventStream } from '../../Domain';

export class SimpleEventSourcedAggregateFactory<T extends EventSourcedAggregateRoot> implements EventSourcedAggregateFactory<T> {

  constructor(private readonly aggregate: EventSourcedAggregateRootConstructor<T>) {

  }

  public async create(id: Identity, events: DomainEventStream): Promise<T> {
    const aggregate = new this.aggregate(id);
    await aggregate.initializeState(events);
    return aggregate;
  }

}
