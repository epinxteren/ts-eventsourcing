import { Identity } from '../ValueObject/Identity';
import { DomainEventStream } from '../Domain/DomainEventStream';

export interface EventStore<Id extends Identity = Identity> {
  has(id: Id): Promise<boolean>;

  load(id: Id): DomainEventStream;

  loadAll(): DomainEventStream;

  loadFromPlayhead(id: Id, playhead: number): DomainEventStream;

  append(id: Id, eventStream: DomainEventStream): Promise<void>;
}
