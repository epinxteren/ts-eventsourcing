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
 * To support fluid interface with promise support on every fluid function.
 */
export class EventSourcingFluidTestBench {

  private promise: Promise<void>;

  constructor(private readonly testBench: EventSourcingTestBench, promise: () => Promise<void>) {
    this.promise = promise();
  }

  public givenCommandHandler(createHandler: (testBench: EventSourcingTestBench) => CommandHandler): this {
    return this.asyncProxy('givenCommandHandler', createHandler);
  }

  public givenEventListener(createOrEventListener: EventListener | ((testBench: EventSourcingTestBench) => EventListener)): this {
    return this.asyncProxy('givenEventListener', createOrEventListener);
  }

  public given<T extends EventSourcedAggregateRoot>(
    id: Identity,
    aggregateClass: EventSourcedAggregateRootConstructor<T>,
    events: DomainEvent[]): EventSourcingFluidTestBench {
    return this.asyncProxy('given', id, aggregateClass, events);
  }

  public givenSpies(assignSpies: ((testBench: EventSourcingTestBench) => void)): this {
    return this.asyncProxy('givenSpies', assignSpies);
  }

  public givenCurrentTime(currentTime: Date | string): this {
    return this.asyncProxy('givenCurrentTime', currentTime);
  }

  public whenTimeChanges(currentTime: Date | string): this {
    return this.asyncProxy('whenTimeChanges', currentTime);
  }

  public whenCommands(commands: Command[]): this {
    return this.asyncProxy('whenCommands', commands);
  }

  public whenDomainMessagesHappened(messages: DomainMessage[] | DomainEventStream): this {
    return this.asyncProxy('whenDomainMessagesHappened', messages);
  }

  public whenEventsHappened(id: Identity, events: DomainEvent[]): this {
    return this.asyncProxy('whenEventsHappened', id, events);
  }

  public thenMatchEvents(events: Array<DomainEvent | DomainMessage>): this {
    return this.asyncProxy('thenMatchEvents', events);
  }

  public thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[]>): this {
    return this.asyncProxy('thenModelsShouldMatch', modelsOrFactory);
  }

  public thenAssertModel<T extends ReadModel>(
    modelClass: ReadModelConstructor<T>,
    id: Identity,
    matcher: (model: T, testBench: EventSourcingTestBench) => Promise<void> | void,
  ): this {
    return this.asyncProxy('thenAssertModel', modelClass, id, matcher);
  }

  public thenAssert(asserting: (testBench: EventSourcingTestBench) => Promise<void> | void): this {
    return this.asyncProxy('thenAssert', asserting);
  }

  public thenWaitUntilProcessed(): this {
    return this.asyncProxy('thenWaitUntilProcessed');
  }

  public then<TResult1 = EventSourcingTestBench, TResult2 = never>(onfulfilled?: ((value: EventSourcingTestBench) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this.promise.then(async () => {
      await this.testBench.thenWaitUntilProcessed();
      return this.testBench;
    }).then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<any | TResult> {
    const promise = async () => {
      await this.promise;
      await this.testBench.thenWaitUntilProcessed();
    };
    return promise().catch(onrejected);
  }

  protected asyncProxy<M extends keyof EventSourcingTestBench>(method: M, ...args: any[]) {
    return this.addPending(() => {
      return (this.testBench as any)[method](...args);
    });
  }

  protected addPending(pending: () => Promise<any>): this {
    this.promise = this.promise.then(pending);
    return this;
  }
}
