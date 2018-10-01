import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainEventStream } from '../DomainEventStream';
import { DomainMessage } from '../DomainMessage';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';

export class OverrideDateDomainEventStreamDecorator implements DomainEventStreamDecorator {

  constructor(private getDate: () => Date) {

  }

  public decorate(_aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    return stream.map((message) => {
      return new DomainMessage(
        message.aggregateId,
        message.playhead,
        message.payload,
        this.getDate(),
        message.metadata,
      );
    });
  }

}
