import { DomainEventStream } from './DomainEventStream';
import { concat, Observable, of } from 'rxjs';
import { DomainMessage } from './DomainMessage';
import { filter } from 'rxjs/operators';

export class SimpleDomainEventStream extends Observable<DomainMessage> implements DomainEventStream {

  public static of(messages: DomainMessage[]) {
    return new SimpleDomainEventStream(of(...messages));
  }

  constructor(private readonly events$: Observable<DomainMessage>) {
    super(events$.subscribe.bind(events$));
  }

  public fromPlayhead(playhead: number): DomainEventStream {
    return new SimpleDomainEventStream(this.events$.pipe(filter((message: DomainMessage) => playhead <= message.playhead)));
  }

  public append(eventstream: DomainEventStream): DomainEventStream {
    const combined$ = concat(this.events$, eventstream);
    return new SimpleDomainEventStream(combined$);
  }

}
