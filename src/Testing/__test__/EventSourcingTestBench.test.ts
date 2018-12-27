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
import { QueryHandler } from '../../QueryHandling/QueryHandler';
import { Query } from '../../QueryHandling/Query';
import { HandleQuery } from '../../QueryHandling/HandleQuery';
import { InMemoryRepository } from '../../ReadModel/InMemoryRepository';
import { HandleDomainEvent } from '../../EventHandling/HandleDomainEvent';
import { AbstractLogLevelLogger } from 'triviality-logger/AbstractLogLevelLogger';
import { LogLevel } from 'triviality-logger/LoggerInterface';

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

describe('givenQueryHandler should register queryHandler to the query bus', () => {

  class TestQuery implements Query {

  }

  class TestQueryHandler implements QueryHandler {

    @HandleQuery
    public handle(_query: TestQuery) {
      // Does nothing.
    }

  }

  it('by value', async () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.queryBus, 'subscribe');
    const queryHandler = new TestQueryHandler();
    await testBench.givenQueryHandler(queryHandler);
    expect(spy).toBeCalledWith(queryHandler);
  });

  it('by callback', async () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.queryBus, 'subscribe');
    const queryHandler = new TestQueryHandler();
    await testBench.givenQueryHandler(() => queryHandler);
    expect(spy).toBeCalledWith(queryHandler);
  });

  it('by constructor', async () => {
    const spyConstructor = jest.fn();

    class TestAggregate extends EventSourcedAggregateRoot {

    }

    class TestQueryHandlerWithRepository implements QueryHandler {

      constructor(repository: EventSourcingRepositoryInterface<TestAggregate>) {
        spyConstructor(repository);
      }

      @HandleQuery
      public handle(_query: TestQuery) {
        // Does nothing.
      }

    }

    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.queryBus, 'subscribe');
    await testBench.givenQueryHandler(TestQueryHandlerWithRepository, [TestAggregate]);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(TestQueryHandlerWithRepository);
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

    class TestQueryHandlerWithRepository implements QueryHandler {

      constructor(productRepository: EventSourcingRepositoryInterface<ProductAggregate>,
                  userRepository: EventSourcingRepositoryInterface<UserAggregate>,
                  userReadModellRepository: Repository<UserReadModel>) {
        spyConstructor(productRepository, userRepository, userReadModellRepository);
      }

      @HandleQuery
      public handle(_query: TestQuery) {
        // Does nothing.
      }

    }

    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.queryBus, 'subscribe');
    await testBench
      .givenQueryHandler(
        TestQueryHandlerWithRepository, [ProductAggregate, UserAggregate, UserReadModel]);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(TestQueryHandlerWithRepository);
    expect(spyConstructor).toBeCalledWith(
      testBench.getAggregateTestContext(ProductAggregate).getRepository(),
      testBench.getAggregateTestContext(UserAggregate).getRepository(),
      testBench.getReadModelTestContext(UserReadModel).getRepository(),
    );
  });

});

describe('givenEventListener should be registered to the event bus', () => {
  class TestDomainEvent implements DomainEvent {

  }

  it('by value', async () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {

      @HandleDomainEvent(TestDomainEvent)
      public handle() {
        // Noop.
      }
    }

    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    const eventListener = new TestEventListener();
    await testBench.givenEventListener(eventListener);
    expect(spy).toBeCalledWith(eventListener);
  });

  it('by callback', async () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {
      @HandleDomainEvent(TestDomainEvent)
      public handle() {
        // Noop.
      }
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

      @HandleDomainEvent(TestDomainEvent)
      public handle() {
        // Noop.
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
      .givenEvents(id, TestAggregate, [
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
      .givenEvents(id1, TestAggregate, [
        new TestEvent(),
        new TestEvent2(),
      ])
      .givenEvents(id2, TestAggregate, [
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
      .givenEvents(id1, TestAggregate, [
        new TestEvent(),
      ])
      .givenEvents(id2, TestAggregate2, [
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

  await testBench.givenEvents(UuidIdentity.create(), TestAggregate, [])
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

it('Can give own string reference for model repository', async () => {
  const testRepository = jest.fn();
  const testBench: EventSourcingTestBench = await EventSourcingTestBench
    .create()
    .givenReadModelRepository('MyReference', () => {
      return testRepository as any;
    });
  expect(testBench.getReadModelRepository('MyReference')).toBe(testRepository);
});

describe('Logging', () => {

  let log = jest.fn();

  class TestLogger extends AbstractLogLevelLogger {
    public log(_type: LogLevel, ...message: any[]): void {
      log(message.join(' '));
    }
  }

  beforeEach(() => {
    log = jest.fn();
  });

  it('Can enabled', async () => {
    const logger = {
      info: jest.fn(),
    };
    const testBench = await EventSourcingTestBench
      .create()
      .givenTestLogger(logger as any);
    expect(testBench.getLogger()).toEqual(logger);
  });

  it('Logs messages', async () => {
    const testRepository = jest.fn();
    await EventSourcingTestBench
      .create()
      .givenTestLogger(new TestLogger())
      .givenReadModelRepository('MyReference', () => {
        return testRepository as any;
      })
      .thenAssert(async (testBench) => {
        await testBench.thenModelsShouldMatch([]);
      });
    const logs = log.mock.calls.map((args) => args[0]);
    expect(logs).toMatchSnapshot();
  });

  it('The repository class arguments should be seen in the logs', async () => {
    class ProductAggregate extends EventSourcedAggregateRoot {

    }

    class UserAggregate extends EventSourcedAggregateRoot {

    }

    class UserReadModel implements ReadModel {
      public getId(): Identity {
        throw new Error('not implemented');
      }
    }

    class TestQuery {

    }

    class TestQueryHandlerWithRepository implements QueryHandler {

      constructor(_productRepository: EventSourcingRepositoryInterface<ProductAggregate>,
                  _userRepository: EventSourcingRepositoryInterface<UserAggregate>,
                  _userReadModellRepository: Repository<UserReadModel>,
                  _myRepository: MyRepository) {
        // Does nothing.
      }

      @HandleQuery
      public handle(_query: TestQuery) {
        // Does nothing.
      }

    }

    class MyRepository extends InMemoryRepository<UserReadModel> {
    }

    const testBench = new EventSourcingTestBench();
    await testBench
      .givenTestLogger(new TestLogger())
      .givenReadModelRepository('MyRepository', new MyRepository())
      .givenQueryHandler(
        TestQueryHandlerWithRepository, [ProductAggregate, UserAggregate, UserReadModel, 'MyRepository']);
    const logs = log.mock.calls.map((args) => args[0]);
    expect(logs).toMatchSnapshot();
  });

  describe('defaults', () => {
    const write = process.stdout.write;
    afterEach(() => {
      process.stdout.write = write;
    });
    it('Default logs to process', async () => {
      const testRepository = jest.fn();
      const mock = jest.fn();
      process.stdout.write = mock;
      await EventSourcingTestBench
        .create()
        .givenTestLogger()
        .givenReadModelRepository('MyReference', () => {
          return testRepository as any;
        })
        .thenAssert(async (testBench) => {
          await testBench.thenModelsShouldMatch([]);
        });
      const logs = mock.mock.calls.map((args) => args[0]);
      expect(logs).toMatchSnapshot();
    });
  });

});

it('Should throw error, when there is no error ', (done) => {
  EventSourcingTestBench
    .create()
    .throws('This should not be fine')
    .whenCommands([])
    .toPromise()
    .catch(() => {
      done();
    });
});

describe('Support for manual tasks', () => {
  it('given', async () => {
    const spy = jest.fn();
    const tb = await EventSourcingTestBench
      .create()
      .given(spy);

    expect(spy).toBeCalledWith(tb);
  });

  it('when', async () => {
    const spy = jest.fn();
    const tb = await EventSourcingTestBench
      .create()
      .when(spy);

    expect(spy).toBeCalledWith(tb);
  });

  it('thenAssert', async () => {
    const spy = jest.fn();
    const tb = await EventSourcingTestBench
      .create()
      .thenAssert(spy);

    expect(spy).toBeCalledWith(tb);
  });
});
