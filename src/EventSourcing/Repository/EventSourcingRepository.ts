import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { EventSourcedAggregateFactory } from '../EventSourcedAggregateFactory';
import { EventSourcingRepositoryInterface } from '../EventSourcingRepositoryInterface';
import { Identity } from '../../ValueObject/Identity';
import { EventStore } from '../../EventStore/EventStore';
import { DomainEventBus } from '../../EventHandling/DomainEventBus';
import { DomainEventStream } from '../../Domain/DomainEventStream';
import { DomainEventStreamDecorator } from '../../Domain/DomainEventStreamDecorator';
import { AggregateDomainEventStreamDecorator } from '../../Domain/Decorator/AggregateDomainEventStreamDecorator';

export class EventSourcingRepository<AggregateClass extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> implements EventSourcingRepositoryInterface<AggregateClass, Id> {

  constructor(protected eventStore: EventStore<Id>,
              protected eventBus: DomainEventBus,
              protected aggregateFactory: EventSourcedAggregateFactory<AggregateClass>,
              protected streamDecorator: DomainEventStreamDecorator = new AggregateDomainEventStreamDecorator([])) {
  }

  public async has(id: Id): Promise<boolean> {
    return this.eventStore.has(id);
  }

  public async load(id: Id): Promise<AggregateClass> {
    const domainEventStream = this.eventStore.load(id);
    return this.aggregateFactory.create(id, domainEventStream);
  }

  public async save(aggregate: AggregateClass) {
    const domainEventStream = aggregate.getUncommittedEvents();
    const eventStream = this.decorateForWrite(aggregate, domainEventStream);
    await this.eventStore.append(aggregate.getAggregateRootId(), eventStream);
    await this.eventBus.publish(eventStream);
  }

  protected decorateForWrite(aggregate: AggregateClass, stream: DomainEventStream): DomainEventStream {
    return this.streamDecorator.decorate(aggregate, stream);
  }

}

export type EventSourcingRepositoryConstructor<AggregateClass extends EventSourcedAggregateRoot> = new (
  eventStore: EventStore,
  eventBus: DomainEventBus,
  aggregateFactory: EventSourcedAggregateFactory<AggregateClass>,
  streamDecorator: DomainEventStreamDecorator,
) => EventSourcingRepository<AggregateClass>;

export function isEventSourcingRepositoryConstructor(value: any): value is EventSourcingRepositoryConstructor<any> {
  return typeof value === 'function' &&
  typeof value.prototype === 'object' &&
  typeof value.prototype.load === 'function' &&
  typeof value.prototype.save === 'function';
}
