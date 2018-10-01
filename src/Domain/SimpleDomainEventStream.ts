import { DomainEventStream } from './DomainEventStream';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/filter';
import { DomainMessage } from './DomainMessage';

export class SimpleDomainEventStream extends Observable<DomainMessage> implements DomainEventStream {

  public static of(messages: DomainMessage[]) {
    return new SimpleDomainEventStream(Observable.of(...messages));
  }

  constructor(private readonly events$: Observable<DomainMessage>) {
    super(events$.subscribe.bind(events$));
  }

  public fromPlayhead(playhead: number): DomainEventStream {
    return new SimpleDomainEventStream(this.events$.filter(message => playhead <= message.playhead));
  }

  public append(eventstream: DomainEventStream): DomainEventStream {
    const combined$ = this.events$.concat(eventstream);
    return new SimpleDomainEventStream(combined$);
  }

}
