import { ReplayService } from '../ReplayService';
import { DomainEventStream, SimpleDomainEventStream } from '../Domain';
import { Observable } from 'rxjs/Observable';

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
    loadAll: jest.fn().mockReturnValue(new SimpleDomainEventStream(Observable.throw(new Error('Test')))),
  };
  const domainEventBus = {
    publish: (stream: DomainEventStream) => {
      stream.subscribe();
    },
  };
  const replayService = new ReplayService(eventStoreMock as any, domainEventBus as any);
  await expect(replayService.replay()).rejects.toThrow('Test');
});
