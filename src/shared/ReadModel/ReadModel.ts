import { Identity } from '../Identity';

export interface ReadModel {
  getId(): Identity;
}

export type ReadModelConstructor<T extends ReadModel> = new (...args: any[]) => T;
