import { allAggregateEventHandlersMetadata, AggregateHandleEvent, EventSourcedAggregateRoot } from '..';
import { Identity } from '../../Identity';

it('Should be able te register an event handler', () => {
    class NameHasChangedEvent {

    }

    class User extends EventSourcedAggregateRoot {
        @AggregateHandleEvent
        handler(_event: NameHasChangedEvent) {
        }
    }

    const user = new User(Identity.create());
    const metdata = allAggregateEventHandlersMetadata(user);

    expect(metdata).toEqual([{
        functionName: 'handler',
        event: NameHasChangedEvent,
    }])
});


it('Should be able te register multiple handlers', () => {
    class NameHasChangedEvent {

    }

    class EmailHasChangedEvent {

    }

    class User extends EventSourcedAggregateRoot {
        @AggregateHandleEvent
        handleName1(_event: NameHasChangedEvent) {
        }

        @AggregateHandleEvent
        handleName2(_event: NameHasChangedEvent) {
        }

        @AggregateHandleEvent
        handleEmail(_event: EmailHasChangedEvent) {
        }

    }

    const user = new User(Identity.create());
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
        }
    ])
});

it('Should have event as argument', () => {
    expect(() => {
        class User extends EventSourcedAggregateRoot {
            @AggregateHandleEvent
            handleEvent() {
            }
        }
        new User(Identity.create());
    }).toThrowError();
});
