import { Observable } from 'rxjs';
import { DomainMessage } from './DomainMessage';

export interface DomainEventStream extends Observable<DomainMessage> {

}
