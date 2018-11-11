import { fromQuery } from '../fromQuery';
import { take, toArray } from 'rxjs/operators';

describe('fromQuery', () => {

  function createContext() {
    const query: { skip: jest.Mock, limit: jest.Mock, execute: jest.Mock } = {
      skip: jest.fn(() => query),
      limit: jest.fn(() => query),
      execute: jest.fn(),
    };
    return { query };
  }

  it('Should be able to query empty results', async () => {
    const context = createContext();
    context.query.execute.mockResolvedValue([]);
    const result = await fromQuery(context.query as any).pipe(toArray()).toPromise();
    expect(result).toEqual([]);
  });

  it('Should be able to query for small amounts', async () => {
    const entity = { id: 1 };
    const context = createContext();
    context.query.execute.mockResolvedValue([entity]);
    const result = await fromQuery(context.query as any).pipe(toArray()).toPromise();
    expect(result).toEqual([entity]);
  });

  it('Stops after unsubscribe', async () => {
    const entity1 = { id: 1 };
    const entity2 = { id: 2 };
    const context = createContext();
    context.query.execute.mockResolvedValue([entity1, entity2]);
    const result = await fromQuery(context.query as any).pipe(take(1), toArray()).toPromise();
    expect(result).toEqual([entity1]);
  });

  it('Stops after an error', async () => {
    const context = createContext();
    context.query.execute.mockRejectedValue('error');
    const result = fromQuery(context.query as any).pipe(take(1), toArray()).toPromise();
    await expect(result).rejects.toEqual('error');
  });

  it('Return item paginated', async () => {
    const entity1 = { id: 1 };
    const entity2 = { id: 2 };
    const entity3 = { id: 3 };
    const entity4 = { id: 4 };
    const entity5 = { id: 5 };
    const context = createContext();
    context.query.execute
           .mockResolvedValueOnce([entity1, entity2])
           .mockResolvedValueOnce([entity3, entity4])
           .mockResolvedValueOnce([entity5]);
    const result = await fromQuery(context.query as any, 2).pipe(toArray()).toPromise();

    expect(context.query.limit).toBeCalledWith(2);

    expect(context.query.skip).toBeCalledWith(0);
    expect(context.query.skip).toBeCalledWith(2);
    expect(context.query.skip).toBeCalledWith(4);
    expect(result).toEqual([entity1, entity2, entity3, entity4, entity5]);
  });
});
