import { SimpleCommandBus, CommandBus, CommandHandler, Command } from '../CommandHandling';
import {
  EventSourcedAggregateRoot,
  EventSourcedAggregateRootConstructor,
  EventSourcingRepositoryInterface,
  EventSourcingRepositoryConstructor,
  isEventSourcingRepositoryConstructor,
} from '../EventSourcing';
import {
  AsynchronousDomainEventBus,
  DomainEventBus,
  EventListener,
  RecordDomainEventBusDecorator,
} from '../EventHandling';
import { AggregateTestContextCollection } from './Context/AggregateTestContextCollection';
import { ReadModelTestContextCollection } from './Context/ReadModelTestContextCollection';
import { DomainEvent, DomainMessage, SimpleDomainEventStream, DomainEventStream } from '../Domain';
import { Identity } from '../Identity';
import { DomainMessageTestFactory } from './DomainMessageTestFactory';
import { ReadModel, ReadModelConstructor, Repository } from '../ReadModel';
import { ReadModelTestContext } from './Context/ReadModelTestContext';
import * as moment from 'moment';

export type ValueOrFactory<T, TB> = T | ((testBench: TB) => T);

export class EventSourcingTestBench {
  public static readonly defaultCurrentTime: Date = moment(0).toDate();

  public static create(currentTime?: Date | string) {
    return new this(currentTime);
  }

  public readonly domainMessageFactory: DomainMessageTestFactory;
  public readonly commandBus: CommandBus = new SimpleCommandBus();
  public readonly aggregates: AggregateTestContextCollection;
  public readonly models = new ReadModelTestContextCollection();
  public readonly eventBus: DomainEventBus;
  private readonly asyncBus: AsynchronousDomainEventBus;
  private readonly recordBus: RecordDomainEventBusDecorator;
  private currentTime: Date;
  private promise: Promise<void>;

  constructor(currentTime: Date | string = EventSourcingTestBench.defaultCurrentTime) {
    this.currentTime = this.parseDateTime(currentTime);
    this.asyncBus = new AsynchronousDomainEventBus();
    this.recordBus = new RecordDomainEventBusDecorator(this.asyncBus);
    this.eventBus = this.recordBus;
    this.aggregates = new AggregateTestContextCollection(this);
    this.domainMessageFactory = new DomainMessageTestFactory(this);
    this.promise = Promise.resolve();
  }

  public givenCommandHandler(createOrHandler: ValueOrFactory<CommandHandler, this>) {
    return this.addTask(async () => {
      const handler = this.returnValue(createOrHandler);
      this.commandBus.subscribe(handler);
    });
  }

  public givenEventListener(createOrEventListener: EventListener | ((testBench: this) => EventListener)) {
    return this.addTask(async () => {
      const listener = this.returnValue(createOrEventListener);
      this.eventBus.subscribe(listener);
    });
  }

  public givenSpies(assignSpies: ((testBench: this) => void | Promise<void>)) {
    return this.addTask(async () => assignSpies(this));
  }

  public given<T extends EventSourcedAggregateRoot>(
    id: Identity,
    aggregateClass: EventSourcedAggregateRootConstructor<T>,
    events: DomainEvent[]) {
    return this.addTask(async () => {
      const context = this.aggregates.getByConstructor(aggregateClass);
      const domainMessages = this.domainMessageFactory.createDomainMessages(id, events);
      const stream = SimpleDomainEventStream.of(domainMessages);
      return context.getEventStore().append(id, stream);
    });
  }

  public givenCurrentTime(currentTime: Date | string) {
    return this.addTask(async () => {
      this.currentTime = this.parseDateTime(currentTime);
    });
  }

  public givenAggregateRepository<T extends EventSourcedAggregateRoot>(
    aggregateConstructor: EventSourcedAggregateRootConstructor<T>,
    repositoryOrFactory: ValueOrFactory<EventSourcingRepositoryInterface<T>, this> | EventSourcingRepositoryConstructor<T>) {
    return this.addTask(async () => {
      const Constructor: any = (repositoryOrFactory as any);
      const aggregateTestContext = this.getAggregateTestContext<T>(aggregateConstructor);
      if (isEventSourcingRepositoryConstructor(Constructor)) {
        const repository = new Constructor(
          aggregateTestContext.getEventStore(),
          this.eventBus,
          aggregateTestContext.getAggregateFactory(),
          aggregateTestContext.getEventStreamDecorator(),
        );
        aggregateTestContext.setRepository(repository);
      } else {
        const repository = this.returnValue(repositoryOrFactory as any);
        aggregateTestContext.setRepository(repository);
      }
    });
  }

  public whenTimeChanges(currentTime: Date | string) {
    return this.addTask(async () => {
      this.currentTime = this.parseDateTime(currentTime);
    });
  }

  public whenCommands(commands: Command[]): this {
    return this.addTask(async () => {
      for (const command of commands) {
        await this.commandBus.dispatch(command);
      }
    });
  }

  public whenDomainMessagesHappened(messages: DomainMessage[] | DomainEventStream): this {
    return this.addTask(async () => {
      const stream = messages instanceof Array ? SimpleDomainEventStream.of(messages) : messages;
      this.eventBus.publish(stream);
    });
  }

  public whenEventsHappened(id: Identity, events: DomainEvent[]): this {
    const messages = this.domainMessageFactory.createDomainMessages(id, events);
    return this.whenDomainMessagesHappened(messages);
  }

  public thenMatchEvents(events: Array<DomainEvent | DomainMessage>): this {
    return this.addTask(async () => {
      const messages = await this.getRecordedMessages();
      const actualEvents = messages.map((message, index) => {
        if (events[index] instanceof DomainMessage) {
          return message;
        }
        return message.payload;
      });
      await expect(actualEvents).toEqual(events);
    });
  }

  public thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[], this>): this {
    return this.addTask(async () => {
      await this.thenWaitUntilProcessed();
      const models = this.returnValue(modelsOrFactory);
      for (const model of models) {
        const repository = this.models.getByInstance(model).getRepository();
        const actual = await repository.get(model.getId());
        await expect(actual).toEqual(model);
      }
    });
  }

  public thenAssertModel<T extends ReadModel>(
    modelClass: ReadModelConstructor<T>,
    id: Identity,
    matcher: (model: T, testBench: this) => Promise<void> | void,
  ): this {
    return this.addTask(async () => {
      await this.thenWaitUntilProcessed();
      const repository = this.models.getByConstructor(modelClass).getRepository();
      const model = await repository.get(id);
      await matcher(model, this);
    });
  }

  public thenAssert(asserting: (testBench: this) => Promise<void> | void): this {
    return this.addTask(async () => {
      await this.thenWaitUntilProcessed();
      await asserting(this);
    });
  }

  public getAggregateRepository<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.getAggregateTestContext<T>(aggregateConstructor).getRepository();
  }

  public getEventStore<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.getAggregateTestContext<T>(aggregateConstructor).getEventStore();
  }

  public getEventStreamDecorator<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.getAggregateTestContext<T>(aggregateConstructor).getEventStreamDecorator();
  }

  public getAggregateFactory<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.getAggregateTestContext<T>(aggregateConstructor).getAggregateFactory();
  }

  public getReadModelRepository<T extends ReadModel>(readModelConstructor: ReadModelConstructor<T>): Repository<T> {
    return this.getReadModelTestContext<T>(readModelConstructor).getRepository();
  }

  public getReadModelTestContext<T extends ReadModel>(readModelConstructor: ReadModelConstructor<T>): ReadModelTestContext<T> {
    return this.models.getByConstructor(readModelConstructor);
  }

  public getAggregateTestContext<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.aggregates.getByConstructor<T>(aggregateConstructor);
  }

  public async thenWaitUntilProcessed() {
    await this.asyncBus.untilIdle();
  }

  public async getRecordedMessages() {
    await this.thenWaitUntilProcessed();
    return this.recordBus.getMessages();
  }

  public getCurrentTime(): Date {
    return this.currentTime;
  }

  public getEventBus(): DomainEventBus {
    return this.eventBus;
  }

  protected parseDateTime(date: Date | string): Date {
    const parsed = moment(date);
    if (!parsed.isValid()) {
      throw new Error(`Date is not valid ${date.toString()}`);
    }
    return parsed.toDate();
  }

  protected returnValue<T>(valueOrFactory: ValueOrFactory<T, this>): T {
    return typeof valueOrFactory === 'function' ? valueOrFactory(this) : valueOrFactory;
  }

  protected addTask(pending: () => Promise<void>): this {
    return this.addPending(pending);
  }

  protected addPending(pending: () => Promise<any>): this & Promise<this> {
    this.promise = this.promise.then(pending);
    // next in chain.
    if (typeof (this as any).then === 'function' ||
      typeof (this as any).catch === 'function') {
      return this as any;
    }

    function EventSourcingFluidTestBenchWrapper() {
      // nothing
    }

    (EventSourcingFluidTestBenchWrapper as any).prototype = this;
    const fluidTestBench: any = new (EventSourcingFluidTestBenchWrapper as any)();
    fluidTestBench.then = this.thenPromise.bind(this);
    fluidTestBench.catch = this.catchPromise.bind(this);
    return fluidTestBench as any;
  }

  private thenPromise<TResult1 = this, TResult2 = never>(onfulfilled?: ((value: this) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
    return this.promise.then(async () => {
      this.promise = Promise.resolve();
      await this.thenWaitUntilProcessed();
      return this;
    }).then(onfulfilled, onrejected);
  }

  private catchPromise<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<any | TResult> {
    const promise = async () => {
      await this.promise;
      this.promise = Promise.resolve();
      await this.thenWaitUntilProcessed();
      return this;
    };
    return promise().catch((e: any) => {
      this.promise = Promise.resolve();
      return Promise.reject(e);
    }).catch(onrejected);
  }

}
