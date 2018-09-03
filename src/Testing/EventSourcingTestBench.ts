import { SimpleCommandBus, CommandBus, CommandHandler, Command } from '../CommandHandling';
import { EventSourcedAggregateRoot, EventSourcedAggregateRootConstructor } from '../EventSourcing';
import { AsynchronousDomainEventBus, DomainEventBus, EventListener } from '../EventHandling';
import { AggregateTestContextCollection } from './Context/AggregateTestContextCollection';
import { EventSourcingFluidTestBench } from './EventSourcingFluidTestBench';
import { RecordDomainEventBusDecorator } from '../EventHandling/DomainEventBus/RecordDomainEventBusDecorator';
import { DomainEvent, DomainMessage, SimpleDomainEventStream } from '../Domain';
import { Identity } from '../Identity';
import { DomainEventStream } from '../Domain';
import { DomainMessageTestFactory } from './DomainMessageTestFactory';
import { ReadModelTestContextCollection } from './Context/ReadModelTestContextCollection';
import { ReadModel, ReadModelConstructor, Repository } from '../ReadModel';
import { ReadModelTestContext } from './Context/ReadModelTestContext';
import * as moment from 'moment';

export type ValueOrFactory<T> = T | ((testBench: EventSourcingTestBench) => T);

export class EventSourcingTestBench {
  public static readonly defaultCurrentTime: Date = moment(0).toDate();

  public static create(currentTime?: Date | string) {
    return new this(currentTime);
  }

  public readonly domainMessageFactory = new DomainMessageTestFactory(this);
  public readonly commandBus: CommandBus = new SimpleCommandBus();
  public readonly aggregates = new AggregateTestContextCollection(this);
  public readonly models = new ReadModelTestContextCollection();
  public readonly eventBus: DomainEventBus;
  private readonly asyncBus: AsynchronousDomainEventBus;
  private readonly recordBus: RecordDomainEventBusDecorator;
  private currentTime: Date;

  constructor(currentTime: Date | string = EventSourcingTestBench.defaultCurrentTime) {
    this.currentTime = this.parseDateTime(currentTime);
    this.asyncBus = new AsynchronousDomainEventBus();
    this.recordBus = new RecordDomainEventBusDecorator(this.asyncBus);
    this.eventBus = this.recordBus;
  }

  public givenCommandHandler(createOrHandler: ValueOrFactory<CommandHandler>): this {
    const handler = this.returnValue(createOrHandler);
    this.commandBus.subscribe(handler);
    return this;
  }

  public givenEventListener(createOrEventListener: EventListener | ((testBench: EventSourcingTestBench) => EventListener)): this {
    const listener = this.returnValue(createOrEventListener);
    this.eventBus.subscribe(listener);
    return this;
  }

  public givenSpies(assignSpies: ((testBench: EventSourcingTestBench) => void | Promise<void>)): EventSourcingFluidTestBench {
    return this.makeFluid(async () => assignSpies(this));
  }

  public given<T extends EventSourcedAggregateRoot>(
    id: Identity,
    aggregateClass: EventSourcedAggregateRootConstructor<T>,
    events: DomainEvent[]): EventSourcingFluidTestBench {
    const context = this.aggregates.getByConstructor(aggregateClass);
    const domainMessages = this.domainMessageFactory.createDomainMessages(id, events);
    const stream = SimpleDomainEventStream.of(domainMessages);
    return this.makeFluid(() => context.getEventStore().append(id, stream));
  }

  public givenCurrentTime(currentTime: Date | string) {
    this.currentTime = this.parseDateTime(currentTime);
    return this;
  }

  public whenTimeChanges(currentTime: Date | string) {
    this.currentTime = this.parseDateTime(currentTime);
    return this;
  }

  public whenCommands(commands: Command[]): EventSourcingFluidTestBench {
    return this.makeFluid(async () => {
      for (const command of commands) {
        await this.commandBus.dispatch(command);
      }
    });
  }

  public whenDomainMessagesHappened(messages: DomainMessage[] | DomainEventStream): this {
    const stream = messages instanceof Array ? SimpleDomainEventStream.of(messages) : messages;
    this.eventBus.publish(stream);
    return this;
  }

  public whenEventsHappened(id: Identity, events: DomainEvent[]): this {
    const messages = this.domainMessageFactory.createDomainMessages(id, events);
    return this.whenDomainMessagesHappened(messages);
  }

  public thenMatchEvents(events: Array<DomainEvent | DomainMessage>): EventSourcingFluidTestBench {
    return this.makeFluid(async () => {
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

  public thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[]>): EventSourcingFluidTestBench {
    return this.makeFluid(async () => {
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
    matcher: (model: T, testBench: EventSourcingTestBench) => Promise<void> | void,
  ): EventSourcingFluidTestBench {
    return this.makeFluid(async () => {
      await this.thenWaitUntilProcessed();
      const repository = this.models.getByConstructor(modelClass).getRepository();
      const model = await repository.get(id);
      await matcher(model, this);
    });
  }

  public thenAssert(asserting: (testBench: EventSourcingTestBench) => Promise<void> | void): EventSourcingFluidTestBench {
    return this.makeFluid(async () => {
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

  protected parseDateTime(date: Date | string): Date {
    const parsed = moment(date);
    if (!parsed.isValid()) {
      throw new Error(`Date is not valid ${date.toString()}`);
    }
    return parsed.toDate();
  }

  protected returnValue<T>(valueOrFactory: ValueOrFactory<T>): T {
    return typeof valueOrFactory === 'function' ? valueOrFactory(this) : valueOrFactory;
  }

  protected makeFluid(pending: () => Promise<void>): EventSourcingFluidTestBench {
    return new EventSourcingFluidTestBench(this, pending);
  }

}
