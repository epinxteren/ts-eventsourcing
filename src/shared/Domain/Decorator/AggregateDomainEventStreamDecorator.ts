import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { DomainEventStreamDecorator, DomainEventStream } from '..';

export class AggregateDomainEventStreamDecorator implements DomainEventStreamDecorator {

  constructor(private readonly decorators: DomainEventStreamDecorator[]) {

  }

  public decorate(aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    let chain = stream;
    for (const decorator of this.decorators) {
      chain = decorator.decorate(aggregate, chain);
    }
    return chain;
  }
}
