import { throwError as observableThrowError } from 'rxjs';
import { ReplayService } from '../ReplayService';
import { DomainEventStream } from '../Domain/DomainEventStream';
import { SimpleDomainEventStream } from '../Domain/SimpleDomainEventStream';

it('Can replay streams', async () => {
  const eventStoreMock = {
    loadAll: jest.fn().mockReturnValue(SimpleDomainEventStream.of([1, 2] as any)),
  };
  const values: any[] = [];
  const domainEventBus = {
    publish: (stream: DomainEventStream) => {
      stream.subscribe((value) => values.push(value));
    },
  };
  const replayService = new ReplayService(eventStoreMock as any, domainEventBus as any);
  await replayService.replay();
  expect(values).toEqual([1, 2]);
});

it('Knows when stream fails streams', async () => {
  const eventStoreMock = {
    loadAll: jest.fn().mockReturnValue(new SimpleDomainEventStream(observableThrowError(new Error('Test')))),
  };
  const domainEventBus = {
    publish: (stream: DomainEventStream) => {
      stream.subscribe();
    },
  };
  const replayService = new ReplayService(eventStoreMock as any, domainEventBus as any);
  await expect(replayService.replay()).rejects.toThrow('Test');
});
