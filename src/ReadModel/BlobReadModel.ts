import { ReadModel } from './ReadModel';
import { Identity } from '../ValueObject/Identity';

/**
 * Simple read model, nothing more then a data container.
 */
export class BlobReadModel<T, Id extends Identity = Identity> implements ReadModel<Id> {

  constructor(private readonly id: Id, private readonly payload: T) {

  }

  public getId(): Id {
    return this.id;
  }

  public getPayLoad(): T {
    return this.payload;
  }
}
