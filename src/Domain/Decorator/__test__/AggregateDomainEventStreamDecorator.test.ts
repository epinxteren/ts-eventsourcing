import { SimpleDomainEventStream } from '../../SimpleDomainEventStream';
import { DomainEventStreamDecorator } from '../../DomainEventStreamDecorator';
import { EventSourcedAggregateRoot } from '../../../EventSourcing/EventSourcedAggregateRoot';
import { AggregateDomainEventStreamDecorator } from '../AggregateDomainEventStreamDecorator';

it('Can have no decorators', () => {
  const aggregate: EventSourcedAggregateRoot = jest.fn() as any;
  const decorator = new AggregateDomainEventStreamDecorator([]);
  const stream = SimpleDomainEventStream.of([]);
  const decorated = decorator.decorate(aggregate, stream);
  expect(decorated).toBe(stream);
});

it('Can have a single decorator', () => {
  const aggregate: EventSourcedAggregateRoot = jest.fn() as any;
  const decoratedStream = SimpleDomainEventStream.of([]);
  const decorator: DomainEventStreamDecorator = {
    decorate: jest.fn(() => decoratedStream) as any,
  };
  const decoratorAggregate = new AggregateDomainEventStreamDecorator([decorator]);
  const stream = SimpleDomainEventStream.of([]);
  const decorated = decoratorAggregate.decorate(aggregate, stream);
  expect(decorated).not.toBe(stream);

  // Check if the single decorator is called with correct arguments.
  expect(decorator.decorate).toBeCalledWith(aggregate, stream);
  expect(decorated).toBe(decoratedStream);
});

it('Can have multiple decorators', () => {
  const aggregate: EventSourcedAggregateRoot = jest.fn() as any;
  const decoratedStream1 = SimpleDomainEventStream.of([]);
  const decorator1: DomainEventStreamDecorator = {
    decorate: jest.fn(() => decoratedStream1) as any,
  };
  const decoratedStream2 = SimpleDomainEventStream.of([]);
  const decorator2: DomainEventStreamDecorator = {
    decorate: jest.fn(() => decoratedStream2) as any,
  };
  const decoratorAggregate = new AggregateDomainEventStreamDecorator([decorator1, decorator2]);
  const stream = SimpleDomainEventStream.of([]);
  const decorated = decoratorAggregate.decorate(aggregate, stream);
  expect(decorated).not.toBe(stream);

  // Check if the single decorator is called with correct arguments.
  expect(decorator1.decorate).toBeCalledWith(aggregate, stream);

  // Final stream should be the last stream.
  expect(decorator2.decorate).toBeCalledWith(aggregate, decoratedStream1);
  expect(decorated).toBe(decoratedStream2);
});

it('Can add decorators', () => {
  const aggregate: EventSourcedAggregateRoot = jest.fn() as any;
  const decoratedStream = SimpleDomainEventStream.of([]);
  const decorator: DomainEventStreamDecorator = {
    decorate: jest.fn(() => decoratedStream) as any,
  };
  const decoratorAggregate = new AggregateDomainEventStreamDecorator([]);
  decoratorAggregate.add(decorator);
  const stream = SimpleDomainEventStream.of([]);
  const decorated = decoratorAggregate.decorate(aggregate, stream);
  expect(decorated).not.toBe(stream);

  // Check if the single decorator is called with correct arguments.
  expect(decorator.decorate).toBeCalledWith(aggregate, stream);
  expect(decorated).toBe(decoratedStream);
});
