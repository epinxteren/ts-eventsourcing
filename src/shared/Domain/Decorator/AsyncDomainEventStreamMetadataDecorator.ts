import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainMessage } from '../DomainMessage';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { DomainEventStream } from '../DomainEventStream';
import { SimpleDomainEventStream } from '../SimpleDomainEventStream';

export class AsyncDomainEventStreamMetadataDecorator implements DomainEventStreamDecorator {

  protected variables: {[key: string]: any} = {};

  public decorate(_aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    const decorated = stream.map((message: DomainMessage) => {
      const variables = this.variables;
      Object.assign(message.metadata, variables);
      return message;
    });
    return new SimpleDomainEventStream(decorated);
  }

  public setVariables(variables: {[key: string]: any}) {
    this.variables = variables;
  }
}
