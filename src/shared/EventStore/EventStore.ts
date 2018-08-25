import { DomainEventStream } from '../Domain';
import { Identity } from '../Identity';

export interface EventStore {
  load(id: Identity): DomainEventStream;

  loadAll(): DomainEventStream;

  loadFromPlayhead(id: Identity, playhead: number): DomainEventStream;

  append(id: Identity, eventStream: DomainEventStream): Promise<void>;
}
