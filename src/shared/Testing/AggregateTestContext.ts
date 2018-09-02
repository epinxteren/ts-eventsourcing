import {
  EventSourcedAggregateFactory,
  EventSourcedAggregateRoot, EventSourcedAggregateRootConstructor,
  EventSourcingRepository,
  EventSourcingRepositoryInterface,
  SimpleEventSourcedAggregateFactory
} from '../EventSourcing';
import { EventStore, InMemoryEventStore } from '../EventStore';
import { EventSourcingTestBench } from './EventSourcingTestBench';
import { OverrideDateDomainEventStreamDecorator } from '../Domain/Decorator/OverrideDateDomainEventStreamDecorator';

export class AggregateTestContext<T extends EventSourcedAggregateRoot> {
  private eventStore: EventStore = new InMemoryEventStore();
  private aggregateFactory: EventSourcedAggregateFactory<T> = new SimpleEventSourcedAggregateFactory<T>(
    this.aggregateConstructor
  );
  private repository: EventSourcingRepositoryInterface<T> = new EventSourcingRepository<T>(
    this.eventStore,
    this.testBench.eventBus,
    this.aggregateFactory,
    new OverrideDateDomainEventStreamDecorator(() => this.testBench.getCurrentTime())
  );

  constructor(private readonly aggregateConstructor: EventSourcedAggregateRootConstructor<T>,
              private readonly testBench: EventSourcingTestBench) {

  }

  public getRepository(): EventSourcingRepositoryInterface<T> {
    return this.repository;
  }

  public getEventStore(): EventStore {
    return this.eventStore;
  }

}
