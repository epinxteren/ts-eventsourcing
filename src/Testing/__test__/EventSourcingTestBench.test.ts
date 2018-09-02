/* tslint:disable:max-classes-per-file */

import { EventSourcingTestBench } from '../EventSourcingTestBench';
import { Command, CommandHandler } from '../../CommandHandling';
import { EventListener } from '../../EventHandling';
import { Identity } from '../../Identity';
import { EventSourcedAggregateRoot } from '../../EventSourcing';
import { DomainEvent, DomainEventStream, DomainMessage, SimpleDomainEventStream } from '../../Domain';

describe('givenCommandHandler should register commandHandler to the command bus', () => {
  class TestCommandHandler implements CommandHandler {

  }

  it('by value', () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    const commandHandler = new TestCommandHandler();
    testBench.givenCommandHandler(commandHandler);
    expect(spy).toBeCalledWith(commandHandler);
  });

  it('by callback', () => {
    const testBench = new EventSourcingTestBench();
    const spy = jest.spyOn(testBench.commandBus, 'subscribe');
    const commandHandler = new TestCommandHandler();
    testBench.givenCommandHandler(() => commandHandler);
    expect(spy).toBeCalledWith(commandHandler);
  });

});

describe('givenEventListener should be registered to the event bus', () => {
  it('by value', () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {

    }

    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    const eventListener = new TestEventListener();
    testBench.givenEventListener(eventListener);
    expect(spy).toBeCalledWith(eventListener);
  });

  it('by callback', () => {
    const testBench = new EventSourcingTestBench();

    class TestEventListener implements EventListener {

    }

    const spy = jest.spyOn(testBench.eventBus, 'subscribe');
    const eventListener = new TestEventListener();
    testBench.givenEventListener(() => eventListener);
    expect(spy).toBeCalledWith(eventListener);
  });
});

describe('should call spy factory', () => {
  // :) spy to check if can apply spies :).
  it('sync', async () => {
    const spy = jest.fn();
    const testBench = new EventSourcingTestBench();
    await testBench.givenSpies(spy);
    expect(spy).toBeCalledWith(testBench);
  });

  it('async', async () => {
    const spy = jest.fn();
    const testBench = new EventSourcingTestBench();
    await testBench.givenSpies(async (testBenchArg) => {
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

    const id = Identity.create();

    await testBench
      .given(id, TestAggregate, [
        new TestEvent(),
        new TestEvent2(),
      ]);

    const context = testBench.getAggregateTestContext(TestAggregate);
    const stream = await context.getEventStore().loadAll();
    const messages = await stream.toArray().toPromise();

    expect(messages).toEqual([
      new DomainMessage(id, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id, 1, new TestEvent2(), testBench.getCurrentTime()),
    ]);
  });

  it('Multiple instances', async () => {
    const testBench = new EventSourcingTestBench();

    const id1 = Identity.create();
    const id2 = Identity.create();

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
    const messages = await stream.toArray().toPromise();

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

    const id1 = Identity.create();
    const id2 = Identity.create();

    await testBench
      .given(id1, TestAggregate, [
        new TestEvent(),
      ])
      .given(id2, TestAggregate2, [
        new TestEvent(),
      ]);

    const context1 = testBench.getAggregateTestContext(TestAggregate);
    const stream1 = await context1.getEventStore().loadAll();
    const messages1 = await stream1.toArray().toPromise();

    expect(messages1).toEqual([
      new DomainMessage(id1, 0, new TestEvent(), testBench.getCurrentTime()),
    ]);

    const context2 = testBench.getAggregateTestContext(TestAggregate2);
    const stream2 = await context2.getEventStore().loadAll();
    const messages2 = await stream2.toArray().toPromise();

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

    const id = Identity.create();

    const mock = jest.fn();
    testBench.eventBus.publish = mock;

    await testBench.whenDomainMessagesHappened([
      new DomainMessage(id, 0, new TestEvent(), testBench.getCurrentTime()),
      new DomainMessage(id, 1, new TestEvent(), testBench.getCurrentTime()),
    ]);

    const stream: DomainEventStream = mock.mock.calls[0][0];

    expect(await stream.toArray().toPromise()).toEqual([
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

it('whenEventsHappened should create messages and call whenDomainMessagesHappened', () => {
  class TestEvent implements DomainEvent {

  }

  const testBench = new EventSourcingTestBench();
  testBench.domainMessageFactory.createDomainMessages = jest.fn().mockReturnValueOnce('stub stream');
  testBench.whenDomainMessagesHappened = jest.fn();
  const id = Identity.create();
  testBench.whenEventsHappened(id, [new TestEvent()]);

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

  it('By givenCurrentTime', () => {
    const testBench = new EventSourcingTestBench();
    expect(() => {
      testBench.givenCurrentTime('not valid');
    }).toThrow();
  });

  it('By whenTimeChanges', () => {
    const testBench = new EventSourcingTestBench();
    expect(() => {
      testBench.whenTimeChanges('not valid');
    }).toThrow();
  });

});
