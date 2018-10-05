import uuid from 'uuid/v4';
import { Identity } from './Identity';
import { default as validate } from 'uuid-validate';
import { UuidError } from './Error/UuidError';

export class UuidIdentity implements Identity {

  public static create<T extends UuidIdentity>(this: new (id: string) => T): T {
    return new this(uuid());
  }

  public static of(id: Identity) {
    if (id instanceof this) {
      return id;
    }
    return new this((id as any).toString());
  }

  constructor(private readonly id: string) {
    if (!validate(id, 4)) {
      throw UuidError.notValid();
    }
  }

  public toString() {
    return this.id;
  }

  public equals(id: Identity) {
    return this.id.toString() === id.toString();
  }
}
