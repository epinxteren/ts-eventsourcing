import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainMessage } from '../DomainMessage';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { DomainEventStream } from '../DomainEventStream';
import { SimpleDomainEventStream } from '../SimpleDomainEventStream';

export class DomainEventStreamMetadataDecorator implements DomainEventStreamDecorator {

  constructor(private variables: { [p: string]: any }) {
    this.variables = variables;
  }

  public decorate(_aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    const variables = this.variables;
    const decorated = stream.map((message: DomainMessage) => {
      Object.assign(message.metadata, variables);
      return message;
    });
    return new SimpleDomainEventStream(decorated);
  }
}
