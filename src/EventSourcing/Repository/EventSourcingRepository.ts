import { EventStore } from '../../EventStore';
import { DomainEventBus } from '../../EventHandling';
import { AggregateDomainEventStreamDecorator, DomainEventStream, DomainEventStreamDecorator } from '../../Domain';
import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { EventSourcedAggregateFactory } from '../EventSourcedAggregateFactory';
import { EventSourcingRepositoryInterface } from '../EventSourcingRepositoryInterface';
import { Identity } from '../../Identity';

export class EventSourcingRepository<AggregateClass extends EventSourcedAggregateRoot> implements EventSourcingRepositoryInterface<AggregateClass> {

  constructor(protected eventStore: EventStore,
              protected eventBus: DomainEventBus,
              protected aggregateFactory: EventSourcedAggregateFactory<AggregateClass>,
              protected streamDecorator: DomainEventStreamDecorator = new AggregateDomainEventStreamDecorator([])) {
  }

  public async load(id: Identity): Promise<AggregateClass> {
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
  streamDecorator: DomainEventStreamDecorator
) => EventSourcingRepository<AggregateClass>;

export function isEventSourcingRepositoryConstructor(value: any): value is EventSourcingRepositoryConstructor<any> {
  return typeof value === 'function' &&
  typeof value.prototype === 'object' &&
  typeof value.prototype.load === 'function' &&
  typeof value.prototype.save === 'function';
}
