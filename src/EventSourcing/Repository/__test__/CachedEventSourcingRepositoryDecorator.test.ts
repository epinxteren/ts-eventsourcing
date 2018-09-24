import { CachedEventSourcingRepositoryDecorator } from '../CachedEventSourcingRepositoryDecorator';
import { ScalarIdentity } from '../../../ValueObject/ScalarIdentity';

it('Can load aggregate from the story', async () => {
  const repository = {
    load: jest.fn(),
  };
  const id = new ScalarIdentity('222');
  const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);

  repository.load.mockResolvedValueOnce('Some stub aggregate' as any);

  const aggregateNotFromCache = await decoratedRepository.load(id);
  expect(aggregateNotFromCache).toEqual('Some stub aggregate');

  const aggregateFromCache = await decoratedRepository.load(id);
  expect(aggregateFromCache).toEqual('Some stub aggregate');
});

it('Can save an aggregate', async () => {
  const repository = {
    save: jest.fn(),
  };
  const id = new ScalarIdentity('222');
  const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);

  const aggregate = {
    aggregateId: id,
  };

  await decoratedRepository.save(aggregate as any);
  expect(repository.save).toBeCalledWith(aggregate);

  const aggregateFromCache = await decoratedRepository.load(id);
  expect(aggregateFromCache).toEqual(aggregate);
});

it('Knows it has an aggregate', async () => {
  const repository = {
    has: jest.fn().mockReturnValue(true),
  };
  const id = new ScalarIdentity('222');
  const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);
  expect(await decoratedRepository.has(id)).toBeTruthy();
  expect(repository.has).toBeCalledWith(id);
});

it('Knows it does not have an aggregate', async () => {
  const repository = {
    has: jest.fn().mockReturnValue(false),
  };
  const id = new ScalarIdentity('222');
  const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);
  expect(await decoratedRepository.has(id)).toBeFalsy();
  expect(repository.has).toBeCalledWith(id);
});

it('Knows it has a cached aggregate', async () => {
  const repository = {
    load: jest.fn(),
  };
  const id = new ScalarIdentity('222');
  repository.load.mockResolvedValueOnce('Some stub aggregate' as any);
  const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);
  await decoratedRepository.load(id);
  expect(await decoratedRepository.has(id)).toBeTruthy();
});
