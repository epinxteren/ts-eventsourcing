import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { EventSourcingRepositoryInterface } from '../EventSourcingRepositoryInterface';
import { Identity } from '../../ValueObject/Identity';

/**
 * Loading happens from memory.
 */
export class CachedEventSourcingRepositoryDecorator<AggregateClass extends EventSourcedAggregateRoot<Id>, Id extends Identity = Identity> implements EventSourcingRepositoryInterface<AggregateClass, Id> {
  private readonly memory: { [id: string]: AggregateClass } = {};

  constructor(private readonly repository: EventSourcingRepositoryInterface<AggregateClass>) {
  }

  public async load(id: Id): Promise<AggregateClass> {
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

  public async has(id: Id): Promise<boolean> {
    const key = id.toString();
    if (this.memory[key]) {
      return true;
    }
    return await this.repository.has(id);
  }

}
