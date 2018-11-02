/* tslint:disable:max-classes-per-file */

import { allHandleDomainEventMetadata, HandleDomainEvent } from '../HandleDomainEvent';
import { DomainEvent } from '../../Domain/DomainEvent';
import { IncorrectDomainEventHandlerError } from '../Error/IncorrectDomainEventHandlerError';
import { DomainMessage } from '../../Domain/DomainMessage';
import { EventListener } from '../EventListener';

class UserHasBoughtACarEvent implements DomainEvent {

}

it('Should be able te register an event handler', () => {
  class TestEventHandler implements EventListener {
    @HandleDomainEvent
    public hasBoughtCar(_event: UserHasBoughtACarEvent) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([{
    functionName: 'hasBoughtCar',
    event: UserHasBoughtACarEvent,
    eventArgumentIndex: 0,
  }]);
});

it('Should be able te register an event handler with domain message', () => {
  class TestEventHandler implements EventListener {
    @HandleDomainEvent
    public hasBoughtCar(_event: UserHasBoughtACarEvent, _domainMessage: DomainMessage) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([{
    functionName: 'hasBoughtCar',
    event: UserHasBoughtACarEvent,
    eventArgumentIndex: 0,
  }]);
});

it('Should be able te register an event handler with domain message in different order', () => {
  class TestEventHandler implements EventListener {
    @HandleDomainEvent
    public hasBoughtCar(_domainMessage: DomainMessage, _event: UserHasBoughtACarEvent) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([{
    functionName: 'hasBoughtCar',
    event: UserHasBoughtACarEvent,
    eventArgumentIndex: 1,
  }]);
});

it('Should be able te register multiple event handlers', () => {
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
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([
    {
      functionName: 'hasLoggedIn',
      event: UserLoggedIn,
      eventArgumentIndex: 1,
    },
    {
      functionName: 'hasLoggedOut',
      event: UserLoggedOut,
      eventArgumentIndex: 0,
    },
  ]);
});

it('Should always have event as argument', () => {
  expect(() => {
    class TestEventHandler implements EventListener {
      @HandleDomainEvent
      public hasBoughtCar() {
        // noop
      }
    }

    return new TestEventHandler();
  }).toThrowError(IncorrectDomainEventHandlerError);
});

it('Should not have more then 2 arguments', () => {
  expect(() => {
    class TestEventHandler implements EventListener {
      @HandleDomainEvent
      public hasBoughtCar(_event: UserHasBoughtACarEvent, _message: DomainMessage<UserHasBoughtACarEvent>, _extraArg: number) {
        // noop
      }
    }

    return new TestEventHandler();
  }).toThrowError(IncorrectDomainEventHandlerError);
});

it('Should be able te register an event handler for multiple events', () => {

  class UserHasSoldACarEvent implements DomainEvent {

  }

  class TestEventHandler implements EventListener {
    @HandleDomainEvent(UserHasSoldACarEvent, UserHasBoughtACarEvent)
    public hasBoughtOrSoldCar(_event: UserHasBoughtACarEvent | UserHasBoughtACarEvent) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasSoldACarEvent,
      eventArgumentIndex: 0,
    },
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasBoughtACarEvent,
      eventArgumentIndex: 0,
    },
  ]);
});

it('Should be able te register an event handler for multiple events with domain message argument', () => {

  class UserHasSoldACarEvent implements DomainEvent {

  }

  class TestEventHandler implements EventListener {
    @HandleDomainEvent(UserHasSoldACarEvent, UserHasBoughtACarEvent)
    public hasBoughtOrSoldCar(_message: DomainMessage<UserHasBoughtACarEvent | UserHasSoldACarEvent>, _event: UserHasBoughtACarEvent | UserHasSoldACarEvent) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasSoldACarEvent,
      eventArgumentIndex: 1,
    },
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasBoughtACarEvent,
      eventArgumentIndex: 1,
    },
  ]);
});

it('Should be able te register an event handler for multiple events for multiple handlers', () => {

  class UserHasSoldACarEvent implements DomainEvent {

  }

  class TestEventHandler implements EventListener {
    @HandleDomainEvent(UserHasSoldACarEvent, UserHasBoughtACarEvent)
    public hasBoughtOrSoldCar(_message: DomainMessage<UserHasBoughtACarEvent | UserHasSoldACarEvent>, _event: UserHasBoughtACarEvent | UserHasSoldACarEvent) {
      // noop
    }

    @HandleDomainEvent(UserHasSoldACarEvent, UserHasBoughtACarEvent)
    public hasSoldOrBoughtCar(_event: UserHasBoughtACarEvent | UserHasSoldACarEvent, _message: DomainMessage<UserHasBoughtACarEvent | UserHasSoldACarEvent>) {
      // noop
    }
  }

  const handler = new TestEventHandler();
  const metadata = allHandleDomainEventMetadata(handler);

  expect(metadata).toEqual([
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasSoldACarEvent,
      eventArgumentIndex: 1,
    },
    {
      functionName: 'hasBoughtOrSoldCar',
      event: UserHasBoughtACarEvent,
      eventArgumentIndex: 1,
    },
    {
      functionName: 'hasSoldOrBoughtCar',
      event: UserHasSoldACarEvent,
      eventArgumentIndex: 0,
    },
    {
      functionName: 'hasSoldOrBoughtCar',
      event: UserHasBoughtACarEvent,
      eventArgumentIndex: 0,
    },
  ]);
});

it('Should always give events when used as function', () => {

  expect(() => {
    class TestEventHandler implements EventListener {
      @HandleDomainEvent()
      public hasBoughtCar() {
        // noop
      }
    }

    return new TestEventHandler();
  }).toThrowError(IncorrectDomainEventHandlerError);
});
