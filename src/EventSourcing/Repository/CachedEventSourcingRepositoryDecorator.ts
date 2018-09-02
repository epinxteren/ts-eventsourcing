import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { EventSourcingRepositoryInterface } from '../EventSourcingRepositoryInterface';
import { Identity } from '../../Identity';

/**
 * Loading happens from memory.
 */
export class CachedEventSourcingRepositoryDecorator<AggregateClass extends EventSourcedAggregateRoot> implements EventSourcingRepositoryInterface<AggregateClass> {
  private readonly memory: { [id: string]: AggregateClass } = {};

  constructor(private readonly repository: EventSourcingRepositoryInterface<AggregateClass>) {
  }

  public async load(id: Identity): Promise<AggregateClass> {
    const key = id.toString();
    if (this.memory[key]) {
      return this.memory[key];
    }
    this.memory[key] = await this.repository.load(id);
    return this.memory[key];
  }

  public async save(aggregate: AggregateClass): Promise<void> {
    await this.repository.save(aggregate);
    this.memory[aggregate.aggregateId.toString()] = aggregate;
  }

}
