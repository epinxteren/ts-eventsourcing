import { EventStore } from './EventStore';
import { Identity } from '../ValueObject/Identity';
import { EventStreamNotFoundException } from './Error/EventStreamNotFoundException';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { SimpleDomainEventStream } from '../Domain/SimpleDomainEventStream';
import { toArray } from 'rxjs/operators';
import { DomainMessage } from '../Domain/DomainMessage';
import { PlayheadError } from '../Domain/Error/PlayheadError';

export class InMemoryEventStore<Id extends Identity = Identity> implements EventStore<Id> {

  public static fromArray(events: DomainMessage[]) {
    const instance = new this();
    for (const event of events) {
      const idString = event.aggregateId.toString();
      if (typeof instance.events[idString] === 'undefined') {
        instance.events[idString] = [];
      }
      instance.events[idString].push(event);
    }
    return instance;
  }

  protected readonly events: { [id: string]: DomainMessage[] } = {};

  public async has(id: Id): Promise<boolean> {
    const idString = id.toString();
    const stream = this.events[idString];
    return typeof stream !== 'undefined';
  }

  public load(id: Id): DomainEventStream {
    const idString = id.toString();
    const stream = this.events[idString];
    if (typeof stream !== 'undefined') {
      return SimpleDomainEventStream.of(stream);
    }
    throw EventStreamNotFoundException.streamNotFound(id);
  }

  public loadAll(): DomainEventStream {
    let events: DomainMessage[] = [];
    for (const id in this.events) {
      /* istanbul ignore next line */
      if (this.events.hasOwnProperty(id)) {
        events = events.concat(this.events[id]);
      }
    }
    return SimpleDomainEventStream.of(events);
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    const stream: SimpleDomainEventStream = this.load(id) as any;
    return stream.fromPlayhead(playhead);
  }

  public async append(id: Id, eventStream: DomainEventStream): Promise<void> {
    const idString = id.toString();
    if (typeof this.events[idString] === 'undefined') {
      this.events[idString] = [];
    }
    const events = await eventStream.pipe(toArray()).toPromise();
    const totalEvent = this.events[idString].length;
    let lastPlayhead = totalEvent !== 0 ? this.events[idString][totalEvent - 1].playhead : -1;
    for (const event of events) {
      lastPlayhead += 1;
      if (event.playhead !== (lastPlayhead)) {
        throw PlayheadError.create(lastPlayhead, event.playhead);
      }
    }
    this.events[idString] = this.events[idString].concat(events);
  }

}
