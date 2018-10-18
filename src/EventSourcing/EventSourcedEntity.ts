import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { DomainEvent } from '../Domain/DomainEvent';
import { getAggregateEventHandler } from './AggregateHandleEvent';

export class EventSourcedEntity<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {

  constructor(protected aggregateRoot: T) {
  }

  protected handle(event: DomainEvent) {
    const method = this.getHandlersName(event);
    if (!method) {
      return;
    }
    (this as any)[method](event);
  }

  protected handleRecursively(event: DomainEvent, root: T) {
    this.handle(event);
    for (const entity of this.getChildEntities()) {
      entity.handleRecursively(event, root);
    }
  }

  protected getChildEntities(): Array<EventSourcedEntity<T>> {
    return [];
  }

  protected getHandlersName(event: DomainEvent): string | null {
    return getAggregateEventHandler(this, event);
  }
}

export interface EventSourcedEntityConstructor<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {
  new(...args: any[]): EventSourcedEntity<T>;
}
