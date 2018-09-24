import { Identity } from '../ValueObject/Identity';

export interface ReadModel<Id extends Identity = Identity> {
  getId(): Id;
}

export type ReadModelConstructor<T extends ReadModel> = new (...args: any[]) => T;
