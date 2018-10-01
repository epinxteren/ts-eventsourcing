import { EventSourcingRepository } from '../EventSourcingRepository';
import { EventSourcedAggregateRoot } from '../../EventSourcedAggregateRoot';
import { ScalarIdentity } from '../../../ValueObject/ScalarIdentity';
import { DomainEventStream } from '../../../Domain/DomainEventStream';
import { AggregateDomainEventStreamDecorator } from '../../../Domain/Decorator/AggregateDomainEventStreamDecorator';

describe('EventSourcingRepository', () => {
  let context = testContext();

  function testContext() {
    const eventStore = {
      load: jest.fn(),
      append: jest.fn(),
      has: jest.fn(),
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
    const identity = new ScalarIdentity('test');
    const aggregateRoot: EventSourcedAggregateRoot = 'stub aggregate root' as any;
    context.eventStore.load.mockReturnValue(dummyStream);
    context.aggregateFactory.create.mockReturnValue(aggregateRoot);
    const fetched = await context.repository.load(identity);
    expect(context.eventStore.load).toBeCalledWith(identity);
    expect(context.aggregateFactory.create).toBeCalledWith(identity, dummyStream);
    expect(fetched).toBe(aggregateRoot);
  });

  it('Can save an aggregate', async () => {
    const identity = new ScalarIdentity('test');
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

  it('Knows it has an aggregate', async () => {
    const identity = new ScalarIdentity('test');
    context.eventStore.has.mockReturnValue(true);
    expect(await context.repository.has(identity)).toBeTruthy();
  });

  it('Knows it does not have an aggregate', async () => {
    const identity = new ScalarIdentity('test');
    context.eventStore.has.mockReturnValue(false);
    expect(await context.repository.has(identity)).toBeFalsy();
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
