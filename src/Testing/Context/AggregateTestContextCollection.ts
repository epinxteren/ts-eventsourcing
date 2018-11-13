
import { ClassUtil } from '../../ClassUtil';
import { AggregateTestContext } from './AggregateTestContext';
import { EventSourcingTestBench } from '../EventSourcingTestBench';
import { DomainEvent } from '../../Domain/DomainEvent';
import {
  EventSourcedAggregateRoot,
  EventSourcedAggregateRootConstructor,
} from '../../EventSourcing/EventSourcedAggregateRoot';
import { Identity } from '../../ValueObject/Identity';
import { DomainMessage } from '../../Domain/DomainMessage';
import { toArray } from 'rxjs/operators';

export class AggregateTestContextCollection {
  public readonly aggregateMap: { [aggregateClassName: string]: AggregateTestContext<any> } = {};

  constructor(private readonly testBench: EventSourcingTestBench) {

  }

  public getByConstructor<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T, any>): AggregateTestContext<any> {
    const name: string = ClassUtil.nameOffConstructor(aggregateConstructor);
    if (!this.aggregateMap[name]) {
      this.aggregateMap[name] = new AggregateTestContext(aggregateConstructor, this.testBench);
    }
    return this.aggregateMap[name];
  }

  /**
   * Convenience functions to easy get all messages.
   */
  public async getAllMessages() {
    const result: {[aggregateClassName: string]: DomainMessage[]} = {};
    for (const aggregateClassName in this.aggregateMap) {
      /* istanbul ignore next */
      if (!this.aggregateMap.hasOwnProperty(aggregateClassName)) {
        continue;
      }
      const context = this.aggregateMap[aggregateClassName];
      const store = context.getEventStore();
      const events = store.loadAll();
      result[aggregateClassName] = await events.pipe(toArray()).toPromise();
    }
    return result;
  }

  /**
   * Convenience functions to easy get all events.
   */
  public async getAllEvents() {
    const result: {[aggregateClassName: string]: DomainEvent[]} = {};
    const messages = await this.getAllMessages();
    for (const aggregateClassName in messages) {
      /* istanbul ignore next */
      if (!messages.hasOwnProperty(aggregateClassName)) {
        continue;
      }
      result[aggregateClassName] = messages[aggregateClassName].map((message) => message.payload);
    }
    return result;
  }

  /**
   * Convenience function to get all aggregates.
   */
  public async getAllAggregates() {
    const events = await this.getAllMessages();
    const result: {[aggregateClassName: string]: EventSourcedAggregateRoot[]} = {};
    for (const aggregateClassName in this.aggregateMap) {
      /* istanbul ignore next */
      if (!this.aggregateMap.hasOwnProperty(aggregateClassName)) {
        continue;
      }
      const context = this.aggregateMap[aggregateClassName];
      result[aggregateClassName] = [];
      const ids: Identity[] = [];
      events[aggregateClassName].forEach((event: DomainMessage) => {
        if (ids.indexOf(event.aggregateId) < 0) {
          ids.push(event.aggregateId);
        }
      });
      for (const id of ids) {
        result[aggregateClassName].push(await context.getRepository().load(id));
      }
    }
    return result;
  }

}
