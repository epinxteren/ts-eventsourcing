import {
  EventSourcedAggregateRoot,
  EventSourcedAggregateRootConstructor,
} from '../EventSourcing';
import { ClassUtil } from '../ClassUtil';
import { AggregateTestContext } from './AggregateTestContext';
import { EventSourcingTestBench } from './EventSourcingTestBench';

export class AggregateTestContextCollection {
  public readonly aggregateMap: { [className: string]: AggregateTestContext<any> } = {};

  constructor(private readonly testBench: EventSourcingTestBench) {

  }

  public getByConstructor<T extends EventSourcedAggregateRoot>(aggregateConstructor: EventSourcedAggregateRootConstructor<T>): AggregateTestContext<any> {
    const name: string = ClassUtil.nameOffConstructor(aggregateConstructor);
    if (!this.aggregateMap[name]) {
      this.aggregateMap[name] = new AggregateTestContext(aggregateConstructor, this.testBench);
    }
    return this.aggregateMap[name]
  }

}
