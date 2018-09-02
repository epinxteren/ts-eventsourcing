import { EventSourcingRepository } from '../EventSourcingRepository';
import { Identity } from '../../../Identity';
import { AggregateDomainEventStreamDecorator, DomainEventStream } from '../../../Domain';
import { EventSourcedAggregateRoot } from '../../EventSourcedAggregateRoot';

describe('EventSourcingRepository', () => {
  let context = testContext();

  function testContext() {
    const eventStore = {
      load: jest.fn(),
      append: jest.fn(),
    };
    const domainEventBus = {
      publish: jest.fn(),
    };
    const aggregateFactory = {
      create: jest.fn(),
    };
    const domainEventStreamDecorator = {
      decorate: jest.fn((_aggregate, stream) => stream),
    };
    const repository = new EventSourcingRepository(
      eventStore as any,
      domainEventBus as any,
      aggregateFactory as any,
      domainEventStreamDecorator as any,
    );
    return {
      repository,
      eventStore,
      domainEventBus,
      aggregateFactory,
      domainEventStreamDecorator,
    };
  }

  beforeEach(() => {
    context = testContext();
  });

  it('Can load aggregate from an event stream', async () => {
    const dummyStream: DomainEventStream = 'stub event stream' as any;
    const identity = new Identity('test');
    const aggregateRoot: EventSourcedAggregateRoot = 'stub aggregate root' as any;
    context.eventStore.load.mockReturnValue(dummyStream);
    context.aggregateFactory.create.mockReturnValue(aggregateRoot);
    const fetched = await context.repository.load(identity);
    expect(context.eventStore.load).toBeCalledWith(identity);
    expect(context.aggregateFactory.create).toBeCalledWith(identity, dummyStream);
    expect(fetched).toBe(aggregateRoot);
  });

  it('Can save an aggregate', async () => {
    const identity = new Identity('test');
    const stream = ['event 1', 'event 2'];
    const aggregateRoot: EventSourcedAggregateRoot = {
      getAggregateRootId: () => identity,
      getUncommittedEvents: jest.fn().mockReturnValue(stream),
    } as any;

    await context.repository.save(aggregateRoot);
    expect(context.domainEventBus.publish).toBeCalledWith(stream);
    expect(context.eventStore.append).toBeCalledWith(identity, stream);
    expect(context.domainEventStreamDecorator.decorate).toBeCalledWith(aggregateRoot, stream);
  });

  it('Has a default AggregateDomainEventStreamDecorator', async () => {
    const repository2 = new EventSourcingRepository(
      context.eventStore as any,
      context.domainEventBus as any,
      context.aggregateFactory as any,
    );
    expect((repository2 as any).streamDecorator).toBeInstanceOf(AggregateDomainEventStreamDecorator);
  });
});
