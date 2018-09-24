import { Identity } from '../../ValueObject/Identity';

export class EventStreamNotFoundException extends Error {
  public static streamNotFound(id: Identity) {
    return new this(`EventStream not found for aggregate with id ${id.toString()}`);
  }
}
