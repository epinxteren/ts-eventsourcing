import { DomainEventStreamDecorator } from '../DomainEventStreamDecorator';
import { DomainEventStream } from '../DomainEventStream';
import { SimpleDomainEventStream } from '../SimpleDomainEventStream';
import { PlayheadError } from '../Error/PlayheadError';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { tap } from 'rxjs/operators';

export class PlayheadValidatorDomainEventStreamDecorator implements DomainEventStreamDecorator {

  constructor(private playhead: number | null = null) {

  }

  public validate(stream: DomainEventStream): DomainEventStream {
    return new SimpleDomainEventStream(stream.pipe(tap(message => {
      if (this.playhead === null) {
        this.playhead = message.playhead;
      }
      if (message.playhead !== this.playhead) {
        throw PlayheadError.create(this.playhead, message.playhead);
      }
      this.playhead += 1;
      return true;
    })));
  }

  public decorate(_aggregate: EventSourcedAggregateRoot, stream: DomainEventStream): DomainEventStream {
    return new SimpleDomainEventStream(this.validate(stream));
  }

}
