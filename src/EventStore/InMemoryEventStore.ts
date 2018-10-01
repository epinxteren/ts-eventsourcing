import { EventStore } from './EventStore';
import { Identity } from '../ValueObject/Identity';
import { EventStreamNotFoundException } from './Error/EventStreamNotFoundException';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { SimpleDomainEventStream } from '../Domain/SimpleDomainEventStream';
import { PlayheadValidatorDomainEventStreamDecorator } from '../Domain/Decorator/PlayheadValidatorDomainEventStreamDecorator';
import 'rxjs/add/operator/toArray';

export class InMemoryEventStore<Id extends Identity = Identity> implements EventStore<Id> {

  private readonly events: { [id: string]: SimpleDomainEventStream } = {};

  public has(id: Id): boolean {
    const idString = id.toString();
    const stream = this.events[idString];
    return typeof stream !== 'undefined';
  }

  public load(id: Id): DomainEventStream {
    const idString = id.toString();
    const stream = this.events[idString];
    if (typeof stream !== 'undefined') {
      return stream;
    }
    throw EventStreamNotFoundException.streamNotFound(id);
  }

  public loadAll(): DomainEventStream {
    let str = SimpleDomainEventStream.of([]);
    for (const id in this.events) {
      /* istanbul ignore next line */
      if (this.events.hasOwnProperty(id)) {
        str = str.append(this.events[id]) as any;
      }
    }
    return str;
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    const stream: SimpleDomainEventStream = this.load(id) as any;
    return stream.fromPlayhead(playhead);
  }

  public async append(id: Id, eventstream: DomainEventStream): Promise<void> {
    const idString = id.toString();
    if (typeof this.events[idString] === 'undefined') {
      this.events[idString] = SimpleDomainEventStream.of([]);
    }
    const eventStream = this.events[idString];
    const combinedStream = eventStream.append(eventstream);
    const validator = new PlayheadValidatorDomainEventStreamDecorator();
    const result = await validator.validate(combinedStream).toArray().toPromise();
    this.events[idString] = SimpleDomainEventStream.of(result);
  }

}
