import { SimpleEventSourcedAggregateFactory } from '../SimpleEventSourcedAggregateFactory';
import { EventSourcedAggregateRoot } from '../../EventSourcedAggregateRoot';
import SpyInstance = jest.SpyInstance;
import { ScalarIdentity } from '../../../ValueObject/ScalarIdentity';
import { SimpleDomainEventStream } from '../../../Domain/SimpleDomainEventStream';
import { Identity } from '../../../ValueObject/Identity';
import { DomainMessage } from '../../../Domain/DomainMessage';

it('Can create an aggregate', async () => {

  let spy: SpyInstance | null = null;

  class Aggregate extends EventSourcedAggregateRoot {
    constructor(aggregateId: Identity) {
      super(aggregateId);
      spy = jest.spyOn(this, 'initializeState');
    }
  }

  const factory = new SimpleEventSourcedAggregateFactory(Aggregate);
  const id = new ScalarIdentity('1234');

  const stream = SimpleDomainEventStream.of([
    DomainMessage.recordNow(
      id,
      0,
      {},
    ),
  ]);
  const aggregate = await factory.create(id, stream);
  expect(aggregate).toBeInstanceOf(Aggregate);
  expect(spy).toBeCalledWith(stream);
});
