import { EventSourcingTestBench } from '../EventSourcingTestBench';
import { OverrideDateDomainEventStreamDecorator } from '../../Domain/Decorator/OverrideDateDomainEventStreamDecorator';
import { EventStore } from '../../EventStore/EventStore';
import { InMemoryEventStore } from '../../EventStore/InMemoryEventStore';
import { SimpleEventSourcedAggregateFactory } from '../../EventSourcing/Factory/SimpleEventSourcedAggregateFactory';
import { EventSourcingRepositoryInterface } from '../../EventSourcing/EventSourcingRepositoryInterface';
import { EventSourcedAggregateFactory } from '../../EventSourcing/EventSourcedAggregateFactory';
import {
  EventSourcedAggregateRoot,
  EventSourcedAggregateRootConstructor,
} from '../../EventSourcing/EventSourcedAggregateRoot';
import { EventSourcingRepository } from '../../EventSourcing/Repository/EventSourcingRepository';
import { AggregateDomainEventStreamDecorator } from '../../Domain/Decorator/AggregateDomainEventStreamDecorator';

export class AggregateTestContext<T extends EventSourcedAggregateRoot> {
  private eventStore: EventStore = new InMemoryEventStore();
  private aggregateFactory: EventSourcedAggregateFactory<T> = new SimpleEventSourcedAggregateFactory<T>(
    this.aggregateConstructor,
  );
  private readonly eventStreamDecorator: AggregateDomainEventStreamDecorator;
  private repository: EventSourcingRepositoryInterface<T>;

  constructor(private readonly aggregateConstructor: EventSourcedAggregateRootConstructor<T>,
              private readonly testBench: EventSourcingTestBench) {
    this.eventStreamDecorator = new AggregateDomainEventStreamDecorator([
      new OverrideDateDomainEventStreamDecorator(() => this.testBench.getCurrentTime()),
    ]);
    this.repository = new EventSourcingRepository<T>(
      this.eventStore,
      this.testBench.eventBus,
      this.aggregateFactory,
      this.eventStreamDecorator,
    );
  }

  public getRepository(): EventSourcingRepositoryInterface<T> {
    return this.repository;
  }

  public getEventStore(): EventStore {
    return this.eventStore;
  }

  public getAggregateFactory(): EventSourcedAggregateFactory<T> {
    return this.aggregateFactory;
  }

  public setRepository(repository: EventSourcingRepositoryInterface<T>) {
    this.repository = repository;
  }

  public getEventStreamDecorator(): AggregateDomainEventStreamDecorator {
    return this.eventStreamDecorator;
  }

}
