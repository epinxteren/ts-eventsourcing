import { marbles } from 'rxjs-marbles';
import { ScalarIdentity } from '../../ValueObject/ScalarIdentity';
import { SimpleDomainEventStream } from '../SimpleDomainEventStream';
import { DomainMessage } from '../DomainMessage';
import { toArray } from 'rxjs/operators';

class DomainEvent {

}

describe('SimpleDomainEventStream', () => {

  it('Can iterate over it', marbles(m => {
    const aggregateId = new ScalarIdentity('1');
    const domainMessage1 = new DomainMessage(aggregateId, 1, new DomainEvent(), new Date());
    const domainMessage2 = new DomainMessage(aggregateId, 2, new DomainEvent(), new Date());

    const values = { a: domainMessage1, b: domainMessage2 };

    const source = m.hot('ab|', values);
    const expected = m.cold('ab|', values);

    const stream = new SimpleDomainEventStream(source);
    m.expect(stream).toBeObservable(expected);
  }));

  it('Can append streams', marbles(m => {
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

    const source1 = m.cold('ab|', values);
    const stream1 = new SimpleDomainEventStream(source1);

    const source2 = m.cold('cd|', values);
    const stream2 = new SimpleDomainEventStream(source2);

    const stream = stream1.append(stream2);
    const expected = m.cold('abcd|', values);
    m.expect(stream).toBeObservable(expected);
  }));

  it.skip('Can append hot? streams', marbles(async m => {
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

    const source1 = m.cold('ab|', values);
    const stream1 = new SimpleDomainEventStream(source1);

    const source2 = m.hot('         cd|', values);
    const stream2 = new SimpleDomainEventStream(source2);

    const stream = stream1.append(stream2);
    expect(await stream.pipe(toArray()).toPromise()).toEqual([
      domainMessage1,
      domainMessage2,
      domainMessage3,
      domainMessage4,
    ]);
  }));

  it('Can filter streams from playhead', marbles(m => {
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

    const stream = stream1.fromPlayhead(3);
    const expected = m.cold('--cd|', values);
    m.expect(stream).toBeObservable(expected);
  }));

});
