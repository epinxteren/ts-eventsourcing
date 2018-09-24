import { BlobReadModel } from '..';
import { ScalarIdentity } from '../../ValueObject/ScalarIdentity';

it('Can create readmodel', () => {
  const id = new ScalarIdentity('1');
  const data = { foo: 'bar' };
  const model = new BlobReadModel(id, data);
  expect(model.getId()).toBe(id);
  expect(model.getPayLoad()).toBe(data);
});
