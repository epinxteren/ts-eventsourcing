import { SimpleEventSourcedAggregateFactory } from '../SimpleEventSourcedAggregateFactory';
import { EventSourcedAggregateRoot } from '../../EventSourcedAggregateRoot';
import { Identity } from '../../../Identity';
import { DomainMessage, SimpleDomainEventStream } from '../../../Domain';
import SpyInstance = jest.SpyInstance;

it('Can create an aggregate', async () => {

  let spy: SpyInstance | null = null;

  class Aggregate extends EventSourcedAggregateRoot {
    constructor(aggregateId: Identity) {
      super(aggregateId);
      spy = jest.spyOn(this, 'initializeState');
    }
  }

  const factory = new SimpleEventSourcedAggregateFactory(Aggregate);
  const id = new Identity('1234');

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
