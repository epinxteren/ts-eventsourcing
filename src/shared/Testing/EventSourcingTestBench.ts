import { SimpleCommandBus, CommandBus, CommandHandler, Command } from '../CommandHandling';
import { EventSourcedAggregateRoot, EventSourcedAggregateRootConstructor, } from '../EventSourcing';
import { AsynchronousDomainEventBus, DomainEventBus, EventListener } from '../EventHandling';
import { AggregateTestContextCollection } from './AggregateTestContextCollection';
import { EventSourcingFluidTestBench } from './EventSourcingFluidTestBench';
import { RecordDomainEventBusDecorator } from '../EventHandling/RecordDomainEventBusDecorator';
import { DomainEvent, DomainMessage, SimpleDomainEventStream } from '../Domain';
import { Identity } from '../Identity';
import { DomainEventStream } from '../Domain';
import { DomainMessageTestFactory } from './DomainMessageTestFactory';
import { ReadModelTestContextCollection } from './ReadModelTestContextCollection';
import { ReadModel, ReadModelConstructor, Repository } from '../ReadModel';
import { ReadModelTestContext } from './ReadModelTestContext';
import * as moment from 'moment';
const defDate = new Date();
defDate.setTime(0);

export type ValueOrFactory<T> = T | ((testBench: EventSourcingTestBench) => T);

export class EventSourcingTestBench {
  public static readonly defaultCurrentTime: Date = defDate;
  public readonly domainMessageFactory = new DomainMessageTestFactory(this);
  public readonly commandBus: CommandBus = new SimpleCommandBus();
  public readonly aggregates = new AggregateTestContextCollection(this);
  public readonly models = new ReadModelTestContextCollection();
  private readonly asyncBus = new AsynchronousDomainEventBus();
  private readonly recordBus = new RecordDomainEventBusDecorator(this.asyncBus);
  public readonly eventBus: DomainEventBus = this.recordBus;
  private currentTime: Date;

  public static create(currentTime?: Date | string) {
    return new this(currentTime);
  }

  constructor(currentTime: Date | string = defDate) {
    this.currentTime = this.parseDateTime(currentTime);
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
    return new EventSourcingFluidTestBench(this, async () => assignSpies(this));
  }

  public given<T extends EventSourcedAggregateRoot>(
    id: Identity,
    aggregateClass: EventSourcedAggregateRootConstructor<T>,
    events: DomainEvent[]): EventSourcingFluidTestBench {
    const context = this.aggregates.getByConstructor(aggregateClass);
    const domainMessages = this.domainMessageFactory.createDomainMessages(id, events);
    const stream = SimpleDomainEventStream.of(domainMessages);
    return new EventSourcingFluidTestBench(this, () => context.getEventStore().append(id, stream));
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
    const promise = async () => {
      for (const command of commands) {
        await this.commandBus.dispatch(command);
      }
    };
    return new EventSourcingFluidTestBench(this, promise);
  }

  public whenDomainMessagesHappened(messages: DomainMessage[] | DomainEventStream): this {
    let stream = messages instanceof Array ? SimpleDomainEventStream.of(messages) : messages;
    this.eventBus.publish(stream);
    return this;
  }

  public whenEventsHappened(id: Identity, events: DomainEvent[]): this {
    const messages = this.domainMessageFactory.createDomainMessages(id, events);
    return this.whenDomainMessagesHappened(messages);
  }

  public async thenMatchEvents(events: (DomainEvent | DomainMessage)[]): Promise<this> {
    const messages = await this.getRecordedMessages();
    const actualEvents = messages.map((message, index) => {
      if (events[index] instanceof DomainMessage) {
        return message;
      }
      return message.payload;
    });
    await expect(actualEvents).toEqual(events);
    return this;
  }

  public async thenModelsShouldMatch<T extends ReadModel>(modelsOrFactory: ValueOrFactory<T[]>): Promise<EventSourcingTestBench> {
    await this.asyncBus.untilIdle();
    const models = this.returnValue(modelsOrFactory);

    for (const model of models) {
      const repository = this.models.getByInstance(model).getRepository();
      const actual = await repository.get(model.getId());
      await expect(actual).toEqual(model);
    }

    return this;
  }

  public async thenAssertModel<T extends ReadModel>(
    modelClass: ReadModelConstructor<T>,
    id: Identity,
    matcher: (model: T, testBench: EventSourcingTestBench) => Promise<void> | void
  ): Promise<EventSourcingTestBench> {
    await this.asyncBus.untilIdle();
    const repository = this.models.getByConstructor(modelClass).getRepository();
    const model = await repository.get(id);
    await matcher(model, this);
    return this;
  }

  public async thenAssert(asserting: (testBench: EventSourcingTestBench) => Promise<void> | void): Promise<EventSourcingTestBench> {
    await this.asyncBus.untilIdle();
    await asserting(this);
    return this;
  }

  /**
   * Shorthand function to the the aggregate repository.
   */
  public getAggregateRepository<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>) {
    return this.getAggregateTestContext<T>(aggregateConstructor).getRepository();
  }

  /**
   * Shorthand function to the the aggregate event store.
   */
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

  public async getRecordedMessages() {
    await this.asyncBus.untilIdle();
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
}
