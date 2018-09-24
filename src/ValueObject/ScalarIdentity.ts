import { Identity } from './Identity';

export class ScalarIdentity<T> implements Identity {

  public static create<T>(value: T) {
    return new this<T>(value);
  }

  public static of(id: Identity) {
    if (id instanceof this) {
      return id;
    }
    return new this((id as any).getValue());
  }

  constructor(private readonly id: T) {
  }

  public getValue(): T {
    return this.id;
  }

  public toString() {
    return `${this.id}`;
  }

  public equals(id: Identity) {
    return this.id.toString() === id.toString();
  }
}
