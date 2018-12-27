/* tslint:disable:max-classes-per-file */

import { UuidIdentity } from '../../../ValueObject/UuidIdentity';
import { DomainEvent } from '../../../Domain/DomainEvent';
import { AsynchronousDomainEventBus } from '../AsynchronousDomainEventBus';
import { HandleDomainEvent } from '../../HandleDomainEvent';
import { SimpleDomainEventStream } from '../../../Domain/SimpleDomainEventStream';
import { EventListener } from '../../EventListener';
import { DomainMessage } from '../../../Domain/DomainMessage';

it('Knows when it\'s not handling anything', async () => {
  const bus = new AsynchronousDomainEventBus();
  expect(await bus.untilIdle()).toBeFalsy();
});

it('Should ignore event with no handlers', async () => {

  class FoobarEvent implements DomainEvent {

  }

  const bus = new AsynchronousDomainEventBus();
  const message = new DomainMessage(
    UuidIdentity.create(),
    0,
    new FoobarEvent(),
    new Date(),
  );
  bus.publish(SimpleDomainEventStream.of([message]));
  await bus.untilIdle();
});

it('Throw error when there are no handler functions', async () => {
  const bus = new AsynchronousDomainEventBus();
  expect(() => {
    class WithoutHandlers {

    }

    bus.subscribe(new WithoutHandlers());
  }).toThrow();
});

it('Be able to register a single event handler', async () => {

  class UserHasBoughtACarEvent implements DomainEvent {

  }

  class TestEventHandler implements EventListener {

    @HandleDomainEvent
    public hasBoughtCar(_event: UserHasBoughtACarEvent) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const spyHasBoughtCar = jest.spyOn(handler, 'hasBoughtCar');

  const bus = new AsynchronousDomainEventBus();
  bus.subscribe(handler);

  const event = new UserHasBoughtACarEvent();
  const message = new DomainMessage(
    UuidIdentity.create(),
    0,
    event,
    new Date(),
  );
  bus.publish(SimpleDomainEventStream.of([message]));

  await bus.untilIdle();

  expect(spyHasBoughtCar).toBeCalledWith(event, message);
});

it('Be able to register to multiple event (and handle with different argument indexes)', async () => {
  class UserLoggedIn implements DomainEvent {

  }

  class UserLoggedOut implements DomainEvent {

  }

  class LoggedInUserHandler implements EventListener {
    @HandleDomainEvent
    public hasLoggedIn(_message: DomainMessage<UserLoggedIn>, _event: UserLoggedIn) {
      // noop
    }

    @HandleDomainEvent
    public hasLoggedOut(_event: UserLoggedOut, _message: DomainMessage<UserLoggedIn>) {
      // noop
    }
  }

  const handler = new LoggedInUserHandler();
  const userLoggedInSpy = jest.spyOn(handler, 'hasLoggedIn');
  const userLoggedOutSpy = jest.spyOn(handler, 'hasLoggedOut');

  const bus = new AsynchronousDomainEventBus();
  bus.subscribe(handler);

  const userLoggedInMessage = DomainMessage.recordNow(
    UuidIdentity.create(),
    0,
    new UserLoggedIn(),
  );
  const userLoggedOutMessage = DomainMessage.recordNow(
    UuidIdentity.create(),
    0,
    new UserLoggedOut(),
  );

  bus.publish(SimpleDomainEventStream.of([userLoggedInMessage, userLoggedOutMessage]));

  await bus.untilIdle();

  expect(userLoggedInSpy).toBeCalledWith(userLoggedInMessage, userLoggedInMessage.payload);
  expect(userLoggedOutSpy).toBeCalledWith(userLoggedOutMessage.payload, userLoggedOutMessage);
});

it('Be able to register to multiple event handlers for the same event ', async () => {
  class UserLoggedIn implements DomainEvent {

  }

  class LoggedInUserHandler implements EventListener {
    @HandleDomainEvent
    public hasLoggedIn(_message: DomainMessage<UserLoggedIn>, _event: UserLoggedIn) {
      // noop
    }

    @HandleDomainEvent
    public hasLoggedIn2(_event: UserLoggedIn, _message: DomainMessage<UserLoggedIn>) {
      // noop
    }
  }

  const handler = new LoggedInUserHandler();
  const userLoggedInSpy = jest.spyOn(handler, 'hasLoggedIn');
  const userLoggedIn2Spy = jest.spyOn(handler, 'hasLoggedIn2');

  const bus = new AsynchronousDomainEventBus();
  bus.subscribe(handler);

  const userLoggedInMessage = DomainMessage.recordNow(
    UuidIdentity.create(),
    0,
    new UserLoggedIn(),
  );

  bus.publish(SimpleDomainEventStream.of([userLoggedInMessage]));

  await bus.untilIdle();

  expect(userLoggedInSpy).toBeCalledWith(userLoggedInMessage, userLoggedInMessage.payload);
  expect(userLoggedIn2Spy).toBeCalledWith(userLoggedInMessage.payload, userLoggedInMessage);
});

it('Be able to register to multiple event (and handle with different argument indexes)', async () => {
  class HasAddedNumber implements DomainEvent {

    constructor(public readonly value: number) {

    }

  }

  class HasAddedNumberHandler implements EventListener {
    public total = 0;

    @HandleDomainEvent
    public addNumber(event: HasAddedNumber) {
      this.total += event.value;
    }
  }

  const handler = new HasAddedNumberHandler();
  const addNumberInSpy = jest.spyOn(handler, 'addNumber');

  const bus = new AsynchronousDomainEventBus();
  bus.subscribe(handler);

  function createMessage(value: number) {
    return DomainMessage.recordNow(
      UuidIdentity.create(),
      0,
      new HasAddedNumber(value),
    );
  }

  const m1 = createMessage(1);
  const m2 = createMessage(2);
  const m3 = createMessage(3);
  const m4 = createMessage(4);
  const m5 = createMessage(5);
  bus.publish(SimpleDomainEventStream.of([m1, m2, m3, m4, m5]));

  const m6 = createMessage(6);
  const m7 = createMessage(7);
  const m8 = createMessage(8);
  const m9 = createMessage(9);
  const m10 = createMessage(10);
  bus.publish(SimpleDomainEventStream.of([m6, m7, m8, m9, m10]));

  await bus.untilIdle();

  expect(addNumberInSpy.mock.calls).toEqual(
    [
      [m1.payload, m1],
      [m2.payload, m2],
      [m3.payload, m3],
      [m4.payload, m4],
      [m5.payload, m5],
      [m6.payload, m6],
      [m7.payload, m7],
      [m8.payload, m8],
      [m9.payload, m9],
      [m10.payload, m10],
    ],
  );
  expect(handler.total).toBe(55);
});
