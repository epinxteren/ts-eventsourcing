import { Observable } from 'rxjs/Observable';
import { DomainMessage } from './DomainMessage';

export interface DomainEventStream extends Observable<DomainMessage> {

}
