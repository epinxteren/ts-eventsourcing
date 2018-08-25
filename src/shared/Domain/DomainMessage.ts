import { DomainEvent } from './DomainEvent';
import { Identity } from '../Identity';
import { ClassUtil } from '../ClassUtil';

export class DomainMessage<DM extends DomainEvent = DomainEvent> {

  public static recordNow<DM extends DomainEvent = DomainEvent>(aggregateId: Identity,
                                                                playhead: number,
                                                                payload: DM,
                                                                metadata: {[key: string]: any} = {}): DomainMessage {
    return new DomainMessage(aggregateId, playhead, payload, new Date(), metadata);
  }

  constructor(public readonly aggregateId: Identity,
              public readonly playhead: number,
              public readonly payload: DM,
              public readonly recordedOn: Date,
              public readonly metadata: {[key: string]: any} = {}) {
  }

  public toString() {
    const name = ClassUtil.nameOffInstance(this.payload);
    return `${this.aggregateId}:${this.playhead}:${name}`;
  }

}
