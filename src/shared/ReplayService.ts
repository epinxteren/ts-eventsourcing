import { EventStore } from './EventStore';
import { DomainEventBus } from './EventHandling';
import { Subject } from 'rxjs/Subject';
import { SimpleDomainEventStream, DomainMessage } from './Domain';

export class ReplayService {

  constructor(private readonly eventStore: EventStore,
              private readonly messageBus: DomainEventBus) {
  }

  public async replay(): Promise<void> {
    return new Promise<void>((accept, reject) => {
      const subject = new Subject<DomainMessage>();
      this.messageBus.publish(new SimpleDomainEventStream(subject));
      const stream = this.eventStore.loadAll();
      stream.subscribe(subject.next.bind(subject), reject, () => {
        subject.complete();
        accept();
      });
    });
  }

}
