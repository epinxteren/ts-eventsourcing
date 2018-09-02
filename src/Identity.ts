import * as uuid from 'uuid/v4';

export class Identity {

  public static create() {
    return new this(uuid());
  }

  public static of(id: Identity) {
    if (id instanceof this) {
      return id;
    }
    return new this((id as any).toString());
  }

  constructor(private readonly id: string) {

  }

  public toString() {
    return this.id;
  }

  public equals(id: Identity) {
    return this.toString() === id.toString();
  }

}
