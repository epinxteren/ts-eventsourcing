import { ReadModelTestContextCollection } from '../ReadModelTestContextCollection';
import { ReadModel } from '../../../ReadModel';
import { Identity } from '../../..';
import { ReadModelTestContext } from '../ReadModelTestContext';
import { UuidIdentity } from '../../../ValueObject/UuidIdentity';

it('getByInstance should return new context', () => {
  const collection = new ReadModelTestContextCollection();

  class Model implements ReadModel {
    constructor(private id: Identity) {

    }

    public getId(): Identity {
      return this.id;
    }

  }

  const context = collection.getByInstance(new Model(UuidIdentity.create()));
  expect(context).toBeInstanceOf(ReadModelTestContext);
});
