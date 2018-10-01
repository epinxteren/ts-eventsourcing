import * as MockDate from 'mockdate';
import { ScalarIdentity } from '../../ValueObject/ScalarIdentity';
import { DomainEvent } from '../../Domain/DomainEvent';
import { SimpleDomainEventStream } from '../../Domain/SimpleDomainEventStream';
import { AggregateHandleEvent } from '../AggregateHandleEvent';
import { EventSourcedAggregateRoot } from '../EventSourcedAggregateRoot';
import { DomainMessage } from '../../Domain/DomainMessage';
import { EventSourcedEntity } from '../EventSourcedEntity';
import { toArray } from 'rxjs/operators';

/* tslint:disable:max-classes-per-file */

class NameHasChangesEvent implements DomainEvent {
  constructor(public readonly name: string) {
  }
}

class ProductStockHasChanged implements DomainEvent {

  constructor(public readonly stock: number) {
  }

}

class ProductSizeHasChanged implements DomainEvent {

  constructor(public readonly width: number, public readonly height: number) {
  }

}

class Dimensions extends EventSourcedEntity<Product> {

  constructor(root: Product, protected width: number, protected height: number) {
    super(root);
  }

  @AggregateHandleEvent
  protected applyProductSizeHasChanged(event: ProductSizeHasChanged) {
    this.width = event.width;
    this.height = event.height;
  }

}

class Product extends EventSourcedAggregateRoot {

  private _stock: number = 0;
  private _name: string = '';
  private readonly _dimensions: Dimensions = new Dimensions(this, 0, 0);

  get dimensions(): Dimensions {
    return this._dimensions;
  }

  get stock(): number {
    return this._stock;
  }

  get name(): string {
    return this._name;
  }

  public setSize(width: number, height: number) {
    this.apply(new ProductSizeHasChanged(width, height));
  }

  public changeStock(stock: number) {
    this.apply(new ProductStockHasChanged(stock));
  }

  public setName(name: string) {
    this.apply(new NameHasChangesEvent(name));
  }

  protected getChildEntities(): Array<EventSourcedEntity<any>> {
    return [this._dimensions];
  }

  @AggregateHandleEvent
  protected applyNameHasChangesEvent(event: NameHasChangesEvent) {
    this._name = event.name;
  }

  @AggregateHandleEvent
  protected applyProductStockHasChanged(event: ProductStockHasChanged) {
    this._stock = event.stock;
  }
}

describe('EventSourcedAggregateRoot', () => {

  beforeAll(() => {
    const date = new Date();
    date.setTime(1535183762);
    MockDate.set(date, 0);
  });
  afterAll(() => {
    MockDate.reset();
  });

  it('Can give its aggregate id', async () => {
    const identity = new ScalarIdentity('id-213');
    const aggregate = new EventSourcedAggregateRoot(identity);
    expect(aggregate.getAggregateRootId()).toBe(identity);
  });

  it('Can apply single event', async () => {
    const identity = new ScalarIdentity('id-213');
    const aggregate = new Product(identity);
    aggregate.changeStock(10);
    expect(aggregate.stock).toBe(10);
    const actual = await aggregate.getUncommittedEvents().pipe(toArray()).toPromise();
    expect(actual[0].payload).toEqual(new ProductStockHasChanged(10));
    expect(actual[0].playhead).toEqual(0);
    expect(actual[0].aggregateId).toEqual(identity);
    expect(actual.length).toBe(1);
    const actual2 = await aggregate.getUncommittedEvents().pipe(toArray()).toPromise();
    expect(actual2.length).toBe(0);
  });

  it('Can apply multiple events', async () => {
    const identity = new ScalarIdentity('id-213');
    const aggregate = new Product(identity);
    aggregate.changeStock(10);
    aggregate.setName('test');
    expect(aggregate.stock).toBe(10);
    expect(aggregate.name).toBe('test');
    const actual = await aggregate.getUncommittedEvents().pipe(toArray()).toPromise();
    expect(actual[0].payload).toEqual(new ProductStockHasChanged(10));
    expect(actual[0].playhead).toEqual(0);
    expect(actual[0].aggregateId).toEqual(identity);
    expect(actual[1].payload).toEqual(new NameHasChangesEvent('test'));
    expect(actual[1].playhead).toEqual(1);
    expect(actual[1].aggregateId).toEqual(identity);
    expect(actual.length).toBe(2);
  });

  it('Can apply original state', async () => {
    const identity = new ScalarIdentity('id-213');
    const stream = SimpleDomainEventStream.of([
      new DomainMessage(identity, 0, new ProductStockHasChanged(10), new Date()),
      new DomainMessage(identity, 1, new NameHasChangesEvent('test'), new Date()),
      new DomainMessage(identity, 2, new ProductStockHasChanged(12), new Date()),
    ]);
    const aggregate = new Product(identity);
    await aggregate.initializeState(stream);
    expect(aggregate).toMatchSnapshot();
  });

  it('Can have children', async () => {
    const identity = new ScalarIdentity('id-213');
    const aggregate = new Product(identity);
    aggregate.setSize(100, 200);
    expect(aggregate).toMatchSnapshot();
  });

});
