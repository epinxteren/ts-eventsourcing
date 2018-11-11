import { EventStore } from './EventStore';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { Identity } from '../ValueObject/Identity';
import { DomainMessage } from '../Domain/DomainMessage';
import { SerializerInterface } from '../Serializer/SerializerInterface';
import { toArray } from 'rxjs/operators';
import * as fs from 'fs';
import { InMemoryEventStore } from './InMemoryEventStore';

interface FileMessage {
  id: string;
  playhead: number;
  payload: string;
  recordedOn: number;
  metadata: string;
}

function toFile(message: DomainMessage, serializer: SerializerInterface): FileMessage {
  return {
    id: serializer.serialize(message.aggregateId),
    playhead: message.playhead,
    payload: serializer.serialize(message.payload),
    recordedOn: message.recordedOn.getTime(),
    metadata: serializer.serialize(message.metadata),
  };
}

function fromFile(message: FileMessage, serializer: SerializerInterface): DomainMessage {
  return new DomainMessage(
    serializer.deserialize(message.id) as any,
    message.playhead,
    serializer.deserialize(message.payload) as any,
    new Date(message.recordedOn),
    serializer.deserialize(message.metadata) as any,
  );
}

export class FileEventStore<Id extends Identity> implements EventStore<Id> {

  public static fromFile(file: string, serializer: SerializerInterface, fileSystem: typeof fs = fs) {
    if (!fileSystem.existsSync(file)) {
      fileSystem.writeFileSync(file, JSON.stringify([]));
    }
    const serialized: FileMessage[] = JSON.parse(fileSystem.readFileSync(file).toString());
    const memoryRepository = InMemoryEventStore.fromArray(serialized.map((event) => fromFile(event, serializer)));
    return new this(file, serializer, memoryRepository, serialized, fs);
  }

  protected constructor(protected readonly file: string,
                        protected readonly serializer: SerializerInterface,
                        protected readonly repository: InMemoryEventStore,
                        protected readonly serialized: FileMessage[],
                        protected readonly fileSystem: typeof fs) {
  }

  public load(id: Id): DomainEventStream {
    return this.loadFromPlayhead(id, 0);
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    return this.repository.loadFromPlayhead(id, playhead);
  }

  public loadAll(): DomainEventStream {
    return this.repository.loadAll();
  }

  public async append(id: Identity, eventStream: DomainEventStream): Promise<void> {
    const events = await eventStream.pipe(toArray()).toPromise();
    events.forEach((event) => this.serialized.push(toFile(event, this.serializer)));
    this.fileSystem.writeFileSync(this.file, JSON.stringify(this.serialized));
    await this.repository.append(id, eventStream);
  }

  public async has(id: Id): Promise<boolean> {
    return await this.repository.has(id);
  }
}
