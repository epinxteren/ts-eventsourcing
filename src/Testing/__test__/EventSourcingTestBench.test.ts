/* tslint:disable:max-classes-per-file */

import { EventSourcingTestBench } from '../EventSourcingTestBench';
import { UuidIdentity } from '../../ValueObject/UuidIdentity';
import { DomainEvent } from '../../Domain/DomainEvent';
import { DomainEventStream } from '../../Domain/DomainEventStream';
import { ReadModel } from '../../ReadModel/ReadModel';
import { EventSourcingRepositoryInterface } from '../../EventSourcing/EventSourcingRepositoryInterface';
import { CommandHandler } from '../../CommandHandling/CommandHandler';
import { HandleCommand } from '../../CommandHandling/HandleCommand';
import { Repository } from '../../ReadModel/Repository';
import { Command } from '../../CommandHandling/Command';
import { SimpleDomainEventStream } from '../../Domain/SimpleDomainEventStream';
import { EventSourcedAggregateRoot } from '../../EventSourcing/EventSourcedAggregateRoot';
import { Identity } from '../../ValueObject/Identity';
import { DomainMessage } from '../../Domain/DomainMessage';
import { EventSourcingRepository } from '../../EventSourcing/Repository/EventSourcingRepository';
import { EventListener } from '../../EventHandling/EventListener';
import { toArray } from 'rxjs/operators';

describe('givenCommandHandler should register commandHandler to the command bus', () => {

  class TestCommand implements Command {

  }

  class TestCommandHandler implements CommandHandler {

    @HandleCommand
    public handle(_command: TestCommand) {
      // Does nothing.
    }

  }

  it('by value', async () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    const commandHandler = new TestCommandHandler();
    await testBench.givenCommandHandler(commandHandler);
    expect(spy).toBeCalledWith(commandHandler);
  });

  it('by callback', async () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    const commandHandler = new TestCommandHandler();
    await testBench.givenCommandHandler(() => commandHandler);
    expect(spy).toBeCalledWith(commandHandler);
  });

  it('by constructor', async () => {
    const spyConstructor = jest.fn();

    class TestAggregate extends EventSourcedAggregateRoot {

    }

    class TestCommandHandlerWithRepository implements CommandHandler {

      constructor(repository: EventSourcingRepositoryInterface<TestAggregate>) {
        spyConstructor(repository);
      }

      @HandleCommand
      public handle(_command: TestCommand) {
        // Does nothing.
      }

    }

    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    await testBench.givenCommandHandler(TestCommandHandlerWithRepository, [TestAggregate]);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(TestCommandHandlerWithRepository);
    expect(spyConstructor).toBeCalledWith(testBench.getAggregateTestContext(TestAggregate).getRepository());
  });

  it('by constructor with multiple repositories', async () => {
    const spyConstructor = jest.fn();

    class ProductAggregate extends EventSourcedAggregateRoot {

    }

    class UserAggregate extends EventSourcedAggregateRoot {

    }

    class UserReadModel implements ReadModel {
      public getId(): Identity {
        throw new Error('not implemented');
      }
    }

    class TestCommandHandlerWithRepository implements CommandHandler {

      constructor(productRepository: EventSourcingRepositoryInterface<ProductAggregate>,
                  userRepository: EventSourcingRepositoryInterface<UserAggregate>,
                  userReadModellRepository: Repository<UserReadModel>) {
        spyConstructor(productRepository, userRepository, userReadModellRepository);
      }

      @HandleCommand
      public handle(_command: TestCommand) {
        // Does nothing.
      }

    }

    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    await testBench.givenCommandHandler(
      TestCommandHandlerWithRepository, [ProductAggregate, UserAggregate, UserReadModel]);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(TestCommandHandlerWithRepository);
    expect(spyConstructor).toBeCalledWith(
      testBench.getAggregateTestContext(ProductAggregate).getRepository(),
      testBench.getAggregateTestContext(UserAggregate).getRepository(),
      testBench.getReadModelTestContext(UserReadModel).getRepository(),
    );
  });

});

describe('givenEventListener should be registered to the event bus', () => {
  it('by value', async () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {

    }

    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    const eventListener = new TestEventListener();
    await testBench.givenEventListener(eventListener);
    expect(spy).toBeCalledWith(eventListener);
  });

  it('by callback', async () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {

    }

    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    const eventListener = new TestEventListener();
    await testBench.givenEventListener(() => eventListener);
    expect(spy).toBeCalledWith(eventListener);
  });

  it('by constructor with multiple repositories', async () => {
    const spyConstructor = jest.fn();

    class ProductAggregate extends EventSourcedAggregateRoot {

    }

    class UserAggregate extends EventSourcedAggregateRoot {

    }

    class UserReadModel implements ReadModel {
      public getId(): Identity {
        throw new Error('not implemented');
      }
    }

    class TestEventListener implements EventListener {

      constructor(productRepository: EventSourcingRepositoryInterface<ProductAggregate>,
                  userRepository: EventSourcingRepositoryInterface<UserAggregate>,
                  userReadModellRepository: Repository<UserReadModel>) {
        spyConstructor(productRepository, userRepository, userReadModellRepository);
      }

    }

    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    await testBench.givenEventListener(TestEventListener, [ProductAggregate, UserAggregate, UserReadModel]);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(TestEventListener);
    expect(spyConstructor).toBeCalledWith(
      testBench.getAggregateTestContext(ProductAggregate).getRepository(),
      testBench.getAggregateTestContext(UserAggregate).getRepository(),
      testBench.getReadModelTestContext(UserReadModel).getRepository(),
    );
  });

});

describe('should call spy factory', () => {
  // :) spy to check if it can apply spies :).
  it('sync', async () => {
    const spy = jest.fn();
    const testBench = new EventSourcingTestBench();
    await testBench.givenSpies(spy);
    expect(spy).toBeCalledWith(testBench);
  });

  it('async', async () => {
    const spy = jest.fn();
    const testBench = await EventSourcingTestBench
      .create()
      .givenSpies(async (testBenchArg) => {
        spy(testBenchArg);
      });
    expect(spy).toBeCalledWith(testBench);
  });
});

describe('Given domain events should be assigned to corresponding aggregate stores', () => {
  class TestEvent implements DomainEvent {

  }

  class TestEvent2 implements DomainEvent {

  }

  class TestAggregate extends EventSourcedAggregateRoot {

  }

  it('Single instance', async () => {
    const testBench = new EventSourcingTestBench();

    const id = UuidIdentity.create();

    await testBench
      .given(id, TestAggregate, [
        new TestEvent(),
        new TestEvent2(),
      ]);

    const context = testBench.getAggregateTestContext(TestAggregate);
    const stream = await context.getEventStore().loadAll();
    const messages = await stream.pipe(toArray()).toPromise();

    expect(messages).toEqual([
      new DomainMessage(id, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id, 1, new TestEvent2(), testBench.getCurrentTime()),
    ]);
  });

  it('Multiple instances', async () => {
    const testBench = new EventSourcingTestBench();

    const id1 = UuidIdentity.create();
    const id2 = UuidIdentity.create();

    await testBench
      .given(id1, TestAggregate, [
        new TestEvent(),
        new TestEvent2(),
      ])
      .given(id2, TestAggregate, [
        new TestEvent(),
        new TestEvent2(),
        new TestEvent2(),
        new TestEvent(),
      ]);

    const context = testBench.getAggregateTestContext(TestAggregate);
    const stream = await context.getEventStore().loadAll();
    const messages = await stream.pipe(toArray()).toPromise();

    expect(messages).toEqual([
      new DomainMessage(id1, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id1, 1, new TestEvent2(), testBench.getCurrentTime()),
      new DomainMessage(id2, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id2, 1, new TestEvent2(), testBench.getCurrentTime()),
      new DomainMessage(id2, 2, new TestEvent2(), testBench.getCurrentTime()),
      new DomainMessage(id2, 3, new TestEvent(), testBench.getCurrentTime()),
    ]);
  });

  it('Different aggregates', async () => {

    class TestAggregate2 extends EventSourcedAggregateRoot {

    }

    const testBench = new EventSourcingTestBench();

    const id1 = UuidIdentity.create();
    const id2 = UuidIdentity.create();

    await testBench
      .given(id1, TestAggregate, [
        new TestEvent(),
      ])
      .given(id2, TestAggregate2, [
        new TestEvent(),
      ]);

    const context1 = testBench.getAggregateTestContext(TestAggregate);
    const stream1 = await context1.getEventStore().loadAll();
    const messages1 = await stream1.pipe(toArray()).toPromise();

    expect(messages1).toEqual([
      new DomainMessage(id1, 0, new TestEvent(), testBench.getCurrentTime()),
    ]);

    const context2 = testBench.getAggregateTestContext(TestAggregate2);
    const stream2 = await context2.getEventStore().loadAll();
    const messages2 = await stream2.pipe(toArray()).toPromise();

    expect(messages2).toEqual([
      new DomainMessage(id2, 0, new TestEvent(), testBench.getCurrentTime()),
    ]);
  });

});

it('givenCurrentTime should assign the time', () => {
  const testBench = new EventSourcingTestBench();
  const time = new Date();
  testBench.givenCurrentTime(time);
  expect(time).toBe(time);
});

it('whenTimeChanges should assign the time', () => {
  const testBench = new EventSourcingTestBench();
  const time = new Date();
  testBench.whenTimeChanges(time);
  expect(time).toBe(time);
});

it('whenCommands should dispatch commands on command bus', async () => {
  class TestCommand implements Command {

  }

  const testBench = new EventSourcingTestBench();

  testBench.commandBus.dispatch = jest.fn() as any;

  const command1 = new TestCommand();
  const command2 = new TestCommand();
  await testBench.whenCommands([command1, command2]);

  expect(testBench.commandBus.dispatch).toBeCalledWith(command1);
  expect(testBench.commandBus.dispatch).toBeCalledWith(command2);
});

describe('whenDomainMessagesHappened should dispatch messages on event bus', () => {
  it('by array', async () => {
    class TestEvent implements DomainEvent {

    }

    const testBench = new EventSourcingTestBench();

    const id = UuidIdentity.create();

    const mock = jest.fn();
    testBench.eventBus.publish = mock;

    await testBench.whenDomainMessagesHappened([
      new DomainMessage(id, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id, 1, new TestEvent(), testBench.getCurrentTime()),
    ]);

    const stream: DomainEventStream = mock.mock.calls[0][0];

    expect(await stream.pipe(toArray()).toPromise()).toEqual([
      new DomainMessage(id, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id, 1, new TestEvent(), testBench.getCurrentTime()),
    ]);
  });

  it('by stream', async () => {
    const testBench = new EventSourcingTestBench();

    const mock = jest.fn();
    testBench.eventBus.publish = mock;

    const stub = SimpleDomainEventStream.of([]);

    await testBench.whenDomainMessagesHappened(stub);

    const stream: DomainEventStream = mock.mock.calls[0][0];
    expect(stream).toBe(stub);
  });
});

it('whenEventsHappened should create messages and call whenDomainMessagesHappened', async () => {
  class TestEvent implements DomainEvent {

  }

  const testBench = new EventSourcingTestBench();
  testBench.domainMessageFactory.createDomainMessages = jest.fn().mockReturnValueOnce('stub stream');
  testBench.whenDomainMessagesHappened = jest.fn();
  const id = UuidIdentity.create();
  await testBench.whenEventsHappened(id, [new TestEvent()]);

  expect(testBench.domainMessageFactory.createDomainMessages).toBeCalledWith(id, [new TestEvent()]);
  expect(testBench.whenDomainMessagesHappened).toBeCalledWith('stub stream');
});

describe('Should validate date', () => {
  /* tslint:disable:no-console */
  // disable warn message of moment.
  const warn = console.warn;
  console.warn = () => { /* noop */ };
  afterAll(() => {
    console.warn = warn;
  });

  it('By constructor', () => {
    expect(() => {
      return new EventSourcingTestBench('no valid date');
    }).toThrow();
  });

  it('By givenCurrentTime', async () => {
    const testBench = new EventSourcingTestBench();
    await expect(testBench.givenCurrentTime('not valid')).rejects.toThrow();
  });

  it('By whenTimeChanges', async () => {
    const testBench = new EventSourcingTestBench();
    await expect(testBench.whenTimeChanges('not valid')).rejects.toThrow();
  });

});

describe('givenCommandHandler should be able to give own repository', () => {

  class TestAggregate extends EventSourcedAggregateRoot {

  }

  class TestRepository extends EventSourcingRepository<TestAggregate> {
  }

  it('by value', async () => {
    const testBench = new EventSourcingTestBench();
    const context = testBench.getAggregateTestContext(TestAggregate);
    const repository = new TestRepository(
      context.getEventStore(),
      testBench.eventBus,
      context.getAggregateFactory(),
      context.getEventStreamDecorator(),
    );
    await testBench.givenAggregateRepository(TestAggregate, repository);
    expect(testBench.getAggregateRepository(TestAggregate)).toBe(repository);
  });

  it('by callback factory', async () => {
    const testBench = await EventSourcingTestBench
      .create()
      .givenAggregateRepository(TestAggregate, (tb) => {
        return new TestRepository(
          tb.getEventStore(TestAggregate),
          tb.getEventBus(),
          tb.getAggregateFactory(TestAggregate),
          tb.getEventStreamDecorator(TestAggregate),
        );
      });
    expect(testBench.getAggregateRepository(TestAggregate)).toBeInstanceOf(TestRepository);
  });

  it('by default constructor interface', async () => {
    const testBench = await EventSourcingTestBench
      .create()
      .givenAggregateRepository(TestAggregate, TestRepository);
    expect(testBench.getAggregateRepository(TestAggregate)).toBeInstanceOf(TestRepository);
    expect(testBench.getAggregateRepository(TestAggregate)).toMatchSnapshot();
  });

});

it('Can be extended', async () => {

  const spy = jest.fn();

  class MyEventSourcingTestBench extends EventSourcingTestBench {
    public static create(currentTime?: Date | string) {
      return new this(currentTime);
    }

    public givenTheFollowingTest(): this {
      spy('MyEventSourcingTestBench');
      return this;
    }

  }

  class TestAggregate extends EventSourcedAggregateRoot {

  }

  const testBench = await MyEventSourcingTestBench
    .create()
    .givenTheFollowingTest();

  await testBench.given(UuidIdentity.create(), TestAggregate, [])
                 .givenTheFollowingTest();

  expect(spy).toBeCalledWith('MyEventSourcingTestBench');
});

describe('Should handle rejections', () => {
  class MyThrowTestBench extends EventSourcingTestBench {
    public static create(currentTime?: Date | string) {
      return new this(currentTime);
    }

    public givenReject() {
      return this.addTask(() => {
        return Promise.reject('Pew!');
      });
    }

    public givenResolve() {
      return this.addTask(() => {
        return Promise.resolve();
      });
    }
  }

  it('should be able to catch exceptions', () => {
    return expect(MyThrowTestBench.create().givenReject()).rejects.toBe('Pew!');
  });

  it('should be able to catch', async () => {
    const testBench = new MyThrowTestBench();
    const spy = jest.fn();
    try {
      await testBench.givenReject();
    } catch (e) {
      spy(e);
    }
    expect(spy).toBeCalled();
  });

  it('should be able to try to catch exceptions when there are none', async () => {
    const testBench = new MyThrowTestBench();
    const spy = jest.fn();
    await testBench.givenResolve().toPromise().catch(spy);
    expect(spy).not.toBeCalled();
  });

});

describe('Should give a warning for aggregate repository without findAll function', () => {
  class TestReadModel implements ReadModel {
    public getId(): Identity {
      throw new Error('not implemented');
    }
  }

  class TestRepository implements Repository<TestReadModel> {
    public find(_id: Identity): Promise<TestReadModel | null> {
      throw new Error('not implemented');
    }

    public get(_id: Identity): Promise<TestReadModel> {
      throw new Error('not implemented');
    }

    public has(_id: Identity): Promise<boolean> {
      throw new Error('not implemented');
    }

    public remove(_id: Identity): Promise<void> {
      throw new Error('not implemented');
    }

    public save(_model: TestReadModel): Promise<void> {
      throw new Error('not implemented');
    }
  }

  return expect(
    EventSourcingTestBench
      .create()
      .givenReadModelRepository(TestReadModel, () => {
        return new TestRepository();
      })
      .thenShouldMatchSnapshot(),
  ).rejects.toThrowError('Missing find all function on TestRepository');
});
