import { BlobReadModel } from '..';
import { Identity } from '../../Identity';

it('Can create readmodel', () => {
  const id = new Identity('1');
  const data = { foo: 'bar' };
  const model = new BlobReadModel(id, data);
  expect(model.getId()).toBe(id);
  expect(model.getPayLoad()).toBe(data);
});
