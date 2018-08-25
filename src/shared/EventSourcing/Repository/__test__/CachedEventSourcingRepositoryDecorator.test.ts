import { Identity } from '../../../Identity';
import { CachedEventSourcingRepositoryDecorator } from '../CachedEventSourcingRepositoryDecorator';


describe('EventSourcingRepository', () => {

    it('Can load aggregate from the story', async () => {
        const repository = {
            load: jest.fn(),
        };
        const id = new Identity('222');
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
        const id = new Identity('222');
        const decoratedRepository = new CachedEventSourcingRepositoryDecorator(repository as any);

        const aggregate = {
            aggregateId: id,
        };

        await decoratedRepository.save(aggregate as any);
        expect(repository.save).toBeCalledWith(aggregate);

        const aggregateFromCache = await decoratedRepository.load(id);
        expect(aggregateFromCache).toEqual(aggregate);
    });


});

