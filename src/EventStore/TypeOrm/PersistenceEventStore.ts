import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventStore } from '../EventStore';
import { DomainEventStream } from '../../Domain/DomainEventStream';
import { DomainMessageEntity } from './DomainMessageEntity';
import { Identity } from '../../ValueObject/Identity';
import { DomainMessage } from '../../Domain/DomainMessage';
import { SerializerInterface } from '../../Serializer/SerializerInterface';
import { map, mergeMap } from 'rxjs/operators';
import { fromQuery } from './Operator/fromQuery';
import { ClassUtil } from '../../ClassUtil';

export class PersistenceEventStore<Id extends Identity> implements EventStore<Id> {

  constructor(protected readonly repository: Repository<DomainMessageEntity>,
              protected readonly serializer: SerializerInterface) {
  }

  public load(id: Id): DomainEventStream {
    return this.loadFromPlayhead(id, 0);
  }

  public loadFromPlayhead(id: Id, playhead: number): DomainEventStream {
    const entityQuery = this.repository.createQueryBuilder().select()
                            .where('playhead >= :playhead')
                            .andWhere('aggregateId = :id ')
                            .orderBy('id')
                            .orderBy('playhead')
                            .setParameters({
                              playhead,
                              id: id.toString(),
                            });
    return this.wrapQuery(entityQuery);
  }

  public loadAll(): DomainEventStream {
    const entityQuery = this.repository
                            .createQueryBuilder()
                            .select()
                            .orderBy('id')
                            .orderBy('playhead');
    return this.wrapQuery(entityQuery);
  }

  public append(id: Identity, eventStream: DomainEventStream): Promise<void> {
    return eventStream.pipe(mergeMap(async (message) => {
      const entity = new DomainMessageEntity(
        id.toString(),
        this.serializer.serialize(message.aggregateId),
        ClassUtil.nameOff(message.payload),
        message.playhead,
        this.serializer.serialize(message.payload),
        message.recordedOn.getTime(),
        this.serializer.serialize(message.metadata),
      );
      await this.repository.save(entity);
      message.metadata.eventId = entity.id;
    })).toPromise();
  }

  public async has(id: Id): Promise<boolean> {
    return await this.repository.count({ where: { id }, take: 1 }) === 1;
  }

  protected convertToDomainMessage(entity: DomainMessageEntity): DomainMessage<Id> {
    const metadata: any = this.serializer.deserialize(entity.metadata);
    metadata.eventId = entity.id;
    return new DomainMessage(
      this.serializer.deserialize(entity.serializedAggregateId) as any,
      entity.playhead,
      this.serializer.deserialize(entity.payload) as any,
      new Date(entity.recordedOn),
      metadata,
    );
  }

  protected wrapQuery(entityQuery: SelectQueryBuilder<DomainMessageEntity>) {
    return fromQuery(entityQuery)
      .pipe(map((entity) => this.convertToDomainMessage(entity)));
  }
}
