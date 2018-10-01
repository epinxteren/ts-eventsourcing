import { ReadModelTestContextCollection } from '../ReadModelTestContextCollection';
import { ReadModelTestContext } from '../ReadModelTestContext';
import { UuidIdentity } from '../../../ValueObject/UuidIdentity';
import { ReadModel } from '../../../ReadModel/ReadModel';
import { Identity } from '../../../ValueObject/Identity';

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
