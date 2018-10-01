import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainMessage } from '../DomainMessage';
import { DomainEventStream } from '../DomainEventStream';
import { SimpleDomainEventStream } from '../SimpleDomainEventStream';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { map } from 'rxjs/operators';

export class DomainEventStreamMetadataDecorator implements DomainEventStreamDecorator {

  constructor(private readonly variables: { [p: string]: any }) {
    this.variables = variables;
  }

  public decorate(_aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    const variables = this.variables;
    const decorated = stream.pipe(map((message: DomainMessage) => {
      Object.assign(message.metadata, variables);
      return message;
    }));
    return new SimpleDomainEventStream(decorated);
  }
}
