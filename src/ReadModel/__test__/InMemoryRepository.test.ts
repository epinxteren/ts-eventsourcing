import 'jest';
import { ScalarIdentity } from '../../ValueObject/ScalarIdentity';
import { InMemoryRepository } from '../InMemoryRepository';
import { ReadModel } from '../ReadModel';
import { Identity } from '../../ValueObject/Identity';
import { ModelNotFoundException } from '../Error/ModelNotFoundException';
import { toArray } from 'rxjs/operators';

class TestReadModel implements ReadModel {

  constructor(private readonly id: Identity, readonly name: string) {

  }

  public getId(): Identity {
    return this.id;
  }
}

describe('InMemoryRepository', () => {
  it('Starts empty', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const models = await repository.findAll().pipe(toArray()).toPromise();
    expect(models).toEqual([]);
  });
  it('Add single read model', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const model = new TestReadModel(new ScalarIdentity('1'), 'test');
    await repository.save(model);
    const models = await repository.findAll().pipe(toArray()).toPromise();
    expect(models[0]).toBe(model);
  });
  it('Can add multiple models', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const model1 = new TestReadModel(new ScalarIdentity('1'), 'test 1');
    await repository.save(model1);
    const model2 = new TestReadModel(new ScalarIdentity('2'), 'test 2');
    await repository.save(model2);
    const model3 = new TestReadModel(new ScalarIdentity('3'), 'test 3');
    await repository.save(model3);
    const models = await repository.findAll().pipe(toArray()).toPromise();
    expect(models).toEqual([model1, model2, model3]);
  });
  it('Can delete models', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const model1 = new TestReadModel(new ScalarIdentity('1'), 'test 1');
    await repository.save(model1);
    const model2 = new TestReadModel(new ScalarIdentity('2'), 'test 2');
    await repository.save(model2);
    const model3 = new TestReadModel(new ScalarIdentity('3'), 'test 3');
    await repository.save(model3);
    await repository.remove(new ScalarIdentity('2'));
    const models = await repository.findAll().pipe(toArray()).toPromise();
    expect(models).toEqual([model1, model3]);
  });
  it('Can find by keys models', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const model1 = new TestReadModel(new ScalarIdentity('1'), 'test 1');
    await repository.save(model1);
    const model2 = new TestReadModel(new ScalarIdentity('2'), 'test');
    await repository.save(model2);
    const identity3 = new ScalarIdentity('3');
    const model3 = new TestReadModel(identity3, 'test');
    await repository.save(model3);

    let models = await repository.findBy({ name: 'test' }).pipe(toArray()).toPromise();
    expect(models).toEqual([model2, model3]);

    models = await repository.findBy({ name: 'test', id: identity3 }).pipe(toArray()).toPromise();
    expect(models).toEqual([model3]);

    models = await repository.findBy({ name: 'test 1', id: identity3 }).pipe(toArray()).toPromise();
    expect(models).toEqual([]);
  });

  it('Can check if it has a model', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const id = new ScalarIdentity('123');
    expect(await repository.has(id)).toBeFalsy();
    await repository.save(new TestReadModel(id, 'test'));
    expect(await repository.has(id)).toBeTruthy();
  });

  it('Can get model from store', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const id = new ScalarIdentity('123');
    const model = new TestReadModel(id, 'test');
    await repository.save(model);
    expect(await repository.get(id)).toBe(model);
  });

  it('Throws error when model is not found', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const id = new ScalarIdentity('123');
    await expect(repository.get(id)).rejects.toEqual(ModelNotFoundException.byId(id));
  });

  it('Can find model from store', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const id = new ScalarIdentity('123');
    const model = new TestReadModel(id, 'test');
    await repository.save(model);
    expect(await repository.find(id)).toBe(model);
  });

  it('Return null when model is not found in store', async () => {
    const repository = new InMemoryRepository<TestReadModel>();
    const id = new ScalarIdentity('123');
    expect(await repository.find(id)).toBe(null);
  });
});
