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

  private promise: Promise<void>;

  constructor(private readonly testBench: EventSourcingTestBench, promise: () => Promise<void>) {
    this.promise = promise();
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

  public thenMatchEvents(events: (DomainEvent | DomainMessage)[]): this {
    return this.proxy('thenMatchEvents', events);
  }

  public thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[]>): this {
    return this.proxy('thenModelsShouldMatch', modelsOrFactory);
  }

  public thenAssertModel<T extends ReadModel>(
    modelClass: ReadModelConstructor<T>,
    id: Identity,
    matcher: (model: T, testBench: EventSourcingTestBench) => Promise<void> | void
  ): this {
    return this.proxy('thenAssertModel', modelClass, id, matcher);
  }

  public thenAssert(asserting: (testBench: EventSourcingTestBench) => Promise<void> | void): this {
    return this.proxy('thenAssert', asserting);
  }

  public then<TResult1 = EventSourcingTestBench, TResult2 = never>(onfulfilled?: ((value: EventSourcingTestBench) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this.promise.then(() => this.testBench).then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<EventSourcingTestBench | TResult> {
    return this.promise.then(() => this.testBench).catch(onrejected);
  }

  protected proxy<M extends keyof EventSourcingTestBench>(method: M, ...args: any[]) {
    return this.addPending(() => {
      return (this.testBench as any)[method](...args);
    });
  }

  protected addPending(pending: () => Promise<any>): this {
    this.promise = this.promise.then(pending);
    return this;
  }
}
