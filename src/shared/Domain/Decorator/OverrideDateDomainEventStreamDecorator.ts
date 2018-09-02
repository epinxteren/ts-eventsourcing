import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainEventStream } from '../DomainEventStream';
import { EventSourcedAggregateRoot } from '../../EventSourcing';
import { DomainMessage } from '../DomainMessage';

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
        message.metadata
      );
    });
  }

}
