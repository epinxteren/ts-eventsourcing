import { DomainEventStreamMetadataDecorator } from '..';
import { SimpleDomainEventStream } from '../../SimpleDomainEventStream';
import { DomainMessage } from '../../DomainMessage';

it('Does nothing by default', async () => {
  const decorator = new DomainEventStreamMetadataDecorator({});
  const message: DomainMessage = {
    metadata: {
      test: 'hi!'
    }
  } as any;
  const stream = SimpleDomainEventStream.of([message]);
  const decorated = decorator.decorate(null as any, stream);
  const result = await decorated.toArray().toPromise();
  expect(result).toEqual([{
    metadata: {
      test: 'hi!'
    }
  }])
});

it('Can set variables on domain event metadata', async () => {
  const decorator = new DomainEventStreamMetadataDecorator({
    someVariable: 'someValue'
  });
  const message: DomainMessage = {
    metadata: {
      test: 'hi!'
    }
  } as any;
  const stream = SimpleDomainEventStream.of([message]);
  const decorated = decorator.decorate(null as any, stream);
  const result = await decorated.toArray().toPromise();
  expect(result).toEqual([{
    metadata: {
      test: 'hi!',
      someVariable: 'someValue'
    }
  }])
});
