
import { ReadModel } from './ReadModel';
import { Identity } from '../Identity';

/**
 * Simple read model, nothing more then a data container.
 */
export class BlobReadModel<T> implements ReadModel {

  constructor(private readonly id: Identity, private readonly payload: T) {

  }

  public getId(): Identity {
    return this.id;
  }

  public getPayLoad(): T {
    return this.payload;
  }
}
