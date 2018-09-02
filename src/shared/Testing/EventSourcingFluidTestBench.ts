import { Command, CommandHandler } from '../CommandHandling';
import { DomainEvent, DomainEventStream, DomainMessage } from '../Domain';
import { Identity } from '../Identity';
import {
  EventSourcedAggregateRoot,
  EventSourcedAggregateRootConstructor,
} from '../EventSourcing';
import { EventSourcingTestBench, ValueOrFactory } from './EventSourcingTestBench';
import { EventListener } from '../EventHandling';
import { ReadModel, ReadModelConstructor } from '../ReadModel';

/**
 * Wrapper to support fluid interface with an async queue.
 */
export class EventSourcingFluidTestBench {

  private queue: Array<() => Promise<any>> = [];

  constructor(private readonly testBench: EventSourcingTestBench, promise: () => Promise<void>) {
    this.queue.push(promise);
  }

  public givenCommandHandler(createHandler: (testBench: EventSourcingTestBench) => CommandHandler): this {
    return this.proxy('givenCommandHandler', createHandler);
  }

  public givenEventListener(createOrEventListener: EventListener | ((testBench: EventSourcingTestBench) => EventListener)): this {
    return this.proxy('givenEventListener', createOrEventListener);
  }

  public given<T extends EventSourcedAggregateRoot>(
    id: Identity,
    aggregateClass: EventSourcedAggregateRootConstructor<T>,
    events: DomainEvent[]): EventSourcingFluidTestBench {
    return this.proxy('given', id, aggregateClass, events);
  }

  public givenSpies(assignSpies: ((testBench: EventSourcingTestBench) => void)): this {
    return this.proxy('givenSpies', assignSpies);
  }

  public givenCurrentTime(currentTime: Date | string): this {
    return this.proxy('givenCurrentTime', currentTime);
  }

  public whenTimeChanges(currentTime: Date | string): this {
    return this.proxy('whenTimeChanges', currentTime);
  }

  public whenCommands(commands: Command[]): this {
    return this.proxy('whenCommands', commands);
  }

  public whenDomainMessagesHappened(messages: DomainMessage[] | DomainEventStream): this {
    return this.proxy('whenDomainMessagesHappened', messages);
  }

  public whenEventsHappened(id: Identity, events: DomainEvent[]): this {
    return this.proxy('whenEventsHappened', id, events);
  }

  public thenMatchEvents(events: (DomainEvent | DomainMessage)[]): Promise<EventSourcingTestBench> {
    this.proxy('thenMatchEvents', events);
    return this.waitForPending();
  }

  public thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[]>): Promise<EventSourcingTestBench> {
    this.proxy('thenModelsShouldMatch', modelsOrFactory);
    return this.waitForPending();
  }

  public thenAssertModel<T extends ReadModel>(
    modelClass: ReadModelConstructor<T>,
    id: Identity,
    matcher: (model: T, testBench: EventSourcingTestBench) => Promise<void> | void
  ): Promise<EventSourcingTestBench> {
    this.proxy('thenAssertModel', modelClass, id, matcher);
    return this.waitForPending();
  }

  public thenAssert(asserting: (testBench: EventSourcingTestBench) => Promise<void> | void): Promise<EventSourcingTestBench> {
    this.proxy('thenAssert', asserting);
    return this.waitForPending();
  }

  public async waitForPending(): Promise<EventSourcingTestBench> {
    const queue = this.queue;
    this.queue = [];
    for (const pending of queue) {
      await pending();
    }
    return this.testBench;
  }

  public proxy<M extends keyof EventSourcingTestBench>(method: M, ...args: any[]) {
    return this.addPending(() => {
      const result = (this.testBench as any)[method](...args);
      if (result instanceof EventSourcingFluidTestBench) {
        return result.waitForPending();
      }
      return result;
    });
  }

  private addPending(pending: () => Promise<any>): this {
    this.queue.push(pending);
    return this;
  }
}
