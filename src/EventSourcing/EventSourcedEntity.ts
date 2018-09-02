import { EventSourcedAggregateRoot } from './EventSourcedAggregateRoot';
import { DomainEvent } from '../Domain';

export class EventSourcedEntity<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {

  constructor(protected aggregateRoot: T) {
  }

  protected handle(event: DomainEvent) {
    const method = this.getHandlersName(event);
    if (typeof (this as any)[method] !== 'function') {
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

  private getHandlersName(event: DomainEvent): string {
    const { constructor } = Object.getPrototypeOf(event);
    return `apply${constructor.name}`;
  }
}

export interface EventSourcedEntityConstructor<T extends EventSourcedAggregateRoot = EventSourcedAggregateRoot> {
  new(...args: any[]): EventSourcedEntity<T>;
}
