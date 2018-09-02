import { DomainEvent, DomainMessage } from '../../Domain';
import { Command, CommandHandler, HandleCommand } from '../../CommandHandling';
import { EventSourcedAggregateRoot, EventSourcingRepositoryInterface } from '../../EventSourcing';
import { Identity } from '../../Identity';
import { EventSourcingTestBench } from '../EventSourcingTestBench';

class OrderId extends Identity {

}

class CreateOrder implements Command {
  constructor(public readonly id: OrderId) {

  }
}

class ShipOrder implements Command {
  constructor(public readonly id: OrderId) {

  }
}

class OrderCreated implements DomainEvent {

}

class OrderShipped implements DomainEvent {

}

class Order extends EventSourcedAggregateRoot {

  public static create(id: OrderId) {
    const newOrder = new this(id);
    newOrder.apply(new OrderCreated());
    return newOrder;
  }

  public ship() {
    this.apply(new OrderShipped());
  }

}

class OrderCommandHandler implements CommandHandler {

  constructor(private orderRepository: EventSourcingRepositoryInterface<Order>) {

  }

  @HandleCommand
  public async handleCreateOrder(command: CreateOrder) {
    const order = Order.create(command.id);
    await this.orderRepository.save(order);
  }

  @HandleCommand
  public async handleShipOrder(command: ShipOrder) {
    const order = await this.orderRepository.load(command.id);
    order.ship();
    await this.orderRepository.save(order);
  }
}

it('Should able to handle command', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([new CreateOrder(id)])
    .thenMatchEvents([
      new OrderCreated()
    ]);
});

it('Can do manual assert by callback', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([new CreateOrder(id)])
    .thenAssert(async (testBench) => {
      // Verify repository.
      const orderRepository = testBench.getAggregateRepository(Order);
      expect(await orderRepository.load(id)).toBeInstanceOf(Order);

      // Verify event store.
      const store = testBench.getEventStore(Order);
      const stream = await store.load(id);
      expect(await stream.toArray().toPromise()).toEqual([
        new DomainMessage(id, 0, new OrderCreated(), testBench.getCurrentTime()),
      ]);

      // Verify all recorded messages
      const messages = await testBench.getRecordedMessages();
      expect(messages).toEqual([
        new DomainMessage(id, 0, new OrderCreated(), testBench.getCurrentTime()),
      ]);

      // Verify event by test bench.
      await testBench.thenMatchEvents([new OrderCreated()]);
    });
});

it('Should be able to give initial event', async () => {
  const id = OrderId.create();
  await EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .given(id, Order, [
      new ShipOrder(id)
    ])
    .whenCommands([new ShipOrder(id)])
    .thenMatchEvents([
      new OrderShipped()
    ]);
});

it('Should be able to give multiple commands', async () => {
  const id = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([
      new CreateOrder(id),
      new ShipOrder(id)
    ])
    .thenMatchEvents([
      new OrderCreated(),
      new OrderShipped()
    ]);
});

it('Can also check DomainMessages', async () => {
  const id = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .whenCommands([
      new CreateOrder(id),
      new ShipOrder(id)
    ])
    .thenMatchEvents([
      new DomainMessage(id, 0, new OrderCreated(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(id, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
    ]);
});

it('Can have multiple instances of an aggregate', async () => {
  const id1 = OrderId.create();
  const id2 = OrderId.create();
  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new OrderCommandHandler(testBench.getAggregateRepository(Order));
    })
    .given(id1, Order, [
      new OrderCreated()
    ])
    .given(id2, Order, [
      new OrderCreated()
    ])
    .whenCommands([new ShipOrder(id1)])
    .whenCommands([new ShipOrder(id2)])
    .thenMatchEvents([
      new DomainMessage(id1, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(id2, 1, new OrderShipped(), EventSourcingTestBench.defaultCurrentTime),
    ]);
});

it('Can test different aggregates at the same time', async () => {
  class CustomerId extends Identity {

  }

  class CustomerOrdered implements Command {
    constructor(public readonly customerId: CustomerId, public readonly orderId: OrderId) {

    }
  }

  class CustomerCreatedAccount implements DomainEvent {
  }

  class CustomerHasOrdered implements DomainEvent {
    constructor(public readonly orderId: OrderId) {

    }
  }

  class Customer extends EventSourcedAggregateRoot {
    public hasOrdered(orderId: OrderId) {
      this.apply(new CustomerHasOrdered(orderId));
    }
  }

  class CustomerOrderCommandHandler implements CommandHandler {
    constructor(
      private orderRepository: EventSourcingRepositoryInterface<Order>,
      private customerRepository: EventSourcingRepositoryInterface<Customer>
    ) {

    }

    @HandleCommand
    public async handleCreateOrder(command: CustomerOrdered) {
      const customer = await this.customerRepository.load(command.customerId);
      const order = Order.create(command.orderId);
      await this.orderRepository.save(order);
      customer.hasOrdered(command.orderId);
      await this.customerRepository.save(customer);
    }
  }

  const orderId = new OrderId('order-id');
  const customerId = new CustomerId('customer-id');

  return EventSourcingTestBench
    .create()
    .givenCommandHandler((testBench: EventSourcingTestBench) => {
      return new CustomerOrderCommandHandler(
        testBench.getAggregateRepository(Order),
        testBench.getAggregateRepository(Customer)
      );
    })
    .given(customerId, Customer, [
      new CustomerCreatedAccount()
    ])
    .whenCommands([new CustomerOrdered(customerId, orderId)])
    .thenMatchEvents([
      new DomainMessage(orderId, 0, new OrderCreated(), EventSourcingTestBench.defaultCurrentTime),
      new DomainMessage(customerId, 1, new CustomerHasOrdered(orderId), EventSourcingTestBench.defaultCurrentTime),
    ]);
});
