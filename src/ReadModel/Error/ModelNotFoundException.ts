import { Identity } from '../../ValueObject/Identity';

export class ModelNotFoundException extends Error {
  public static byId(id: Identity) {
    return new this(`Model with id ${id.toString()} not found`);
  }
}
