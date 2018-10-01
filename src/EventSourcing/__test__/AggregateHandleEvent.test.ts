/* tslint:disable:max-classes-per-file */

import { UuidIdentity } from '../../ValueObject/UuidIdentity';
import { AggregateHandleEvent, allAggregateEventHandlersMetadata } from '../AggregateHandleEvent';
import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';

it('Should be able te register an event handler', () => {
  class NameHasChangedEvent {

  }

  class User extends EventSourcedAggregateRoot {
    @AggregateHandleEvent
    public handler(_event: NameHasChangedEvent) {
      // noop
    }
  }

  const user = new User(UuidIdentity.create());
  const metdata = allAggregateEventHandlersMetadata(user);

  expect(metdata).toEqual([{
    functionName: 'handler',
    event: NameHasChangedEvent,
  }]);
});

it('Should know when there are none', () => {
  class User extends EventSourcedAggregateRoot {
  }

  const user = new User(UuidIdentity.create());
  const metdata = allAggregateEventHandlersMetadata(user);

  expect(metdata).toEqual([]);
});

it('Should be able te register multiple handlers', () => {
  class NameHasChangedEvent {

  }

  class EmailHasChangedEvent {

  }

  class User extends EventSourcedAggregateRoot {
    @AggregateHandleEvent
    public handleName1(_event: NameHasChangedEvent) {
      // noop
    }

    @AggregateHandleEvent
    public handleName2(_event: NameHasChangedEvent) {
      // noop
    }

    @AggregateHandleEvent
    public handleEmail(_event: EmailHasChangedEvent) {
      // noop
    }

  }

  const user = new User(UuidIdentity.create());
  const metdata = allAggregateEventHandlersMetadata(user);

  expect(metdata).toEqual([
    {
      functionName: 'handleName1',
      event: NameHasChangedEvent,
    },
    {
      functionName: 'handleName2',
      event: NameHasChangedEvent,
    },
    {
      functionName: 'handleEmail',
      event: EmailHasChangedEvent,
    },
  ]);
});

it('Should have event as argument', () => {
  expect(() => {
    class User extends EventSourcedAggregateRoot {
      @AggregateHandleEvent
      public handleEvent() {
        // noop
      }
    }

    return new User(UuidIdentity.create());
  }).toThrowError();
});
