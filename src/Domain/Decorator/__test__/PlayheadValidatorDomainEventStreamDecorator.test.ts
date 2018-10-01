import 'jest';
import { marbles } from 'rxjs-marbles';
import { PlayheadError } from '../../Error/PlayheadError';
import { PlayheadValidatorDomainEventStreamDecorator } from '../PlayheadValidatorDomainEventStreamDecorator';
import { SimpleDomainEventStream } from '../../SimpleDomainEventStream';
import { DomainMessage } from '../../DomainMessage';
import { ScalarIdentity } from '../../../ValueObject/ScalarIdentity';

class DomainEvent {

}

it('Accept valid playheads', marbles(m => {
  const aggregateId = new ScalarIdentity('1');
  const domainMessage1 = new DomainMessage(aggregateId, 1, new DomainEvent(), new Date());
  const domainMessage2 = new DomainMessage(aggregateId, 2, new DomainEvent(), new Date());
  const domainMessage3 = new DomainMessage(aggregateId, 3, new DomainEvent(), new Date());
  const domainMessage4 = new DomainMessage(aggregateId, 4, new DomainEvent(), new Date());

  const values = {
    a: domainMessage1,
    b: domainMessage2,
    c: domainMessage3,
    d: domainMessage4,
  };

  const source1 = m.cold('abcd|', values);
  const stream1 = new SimpleDomainEventStream(source1);

  const decorator = new PlayheadValidatorDomainEventStreamDecorator();
  const stream = decorator.decorate(null as any, stream1);
  const expected = m.cold('abcd|', values);
  m.expect(stream).toBeObservable(expected);
}));

it('Throws exception for invalid playheads', marbles(m => {
  const aggregateId = new ScalarIdentity('1');
  const domainMessage1 = new DomainMessage(aggregateId, 1, new DomainEvent(), new Date());
  const domainMessage2 = new DomainMessage(aggregateId, 2, new DomainEvent(), new Date());
  const domainMessage3 = new DomainMessage(aggregateId, 4, new DomainEvent(), new Date());
  const domainMessage4 = new DomainMessage(aggregateId, 3, new DomainEvent(), new Date());

  const values = {
    a: domainMessage1,
    b: domainMessage2,
    c: domainMessage3,
    d: domainMessage4,
  };

  const source1 = m.cold('abcd|', values);
  const stream1 = new SimpleDomainEventStream(source1);

  const decorator = new PlayheadValidatorDomainEventStreamDecorator();
  const stream = decorator.decorate(null as any, stream1);
  const expected = m.cold('ab#', values, new PlayheadError('Playhead does not match expected 3 given 4'));
  m.expect(stream).toBeObservable(expected);
}));
