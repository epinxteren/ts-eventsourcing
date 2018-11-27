import { EventSourcingTestBench } from './EventSourcingTestBench';
import { DomainEvent } from '../Domain/DomainEvent';
import { Identity } from '../ValueObject/Identity';
import { DomainMessage } from '../Domain/DomainMessage';

/**
 * Rembers playhead for given ids.
 */
export class DomainMessageTestFactory {
  private playheadMap: { [id: string]: number } = {};

  constructor(private testBench: EventSourcingTestBench) {

  }

  public createDomainMessage<Id extends Identity>(id: Id, event: DomainEvent): DomainMessage<DomainEvent, Id> {
    const playhead = this.getIncreasedPlayheadForIdentity(id);
    return new DomainMessage(id, playhead, event, this.testBench.getCurrentTime());
  }

  public createDomainMessages<Id extends Identity>(id: Id, events: DomainEvent[]): Array<DomainMessage<DomainEvent, Id>> {
    return events.map((event) => {
      return this.createDomainMessage<Id>(id, event);
    });
  }

  private getIncreasedPlayheadForIdentity(id: Identity): number {
    const key = id.toString();
    if (typeof this.playheadMap[key] === 'undefined') {
      this.playheadMap[key] = 0;
    } else {
      this.playheadMap[key] += 1;
    }
    return this.playheadMap[key];
  }
}
