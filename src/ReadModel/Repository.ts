/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Identity } from '../ValueObject/Identity';

export interface Repository<T extends ReadModel, Id extends Identity = Identity> {
  save(model: T): Promise<void>;

  has(id: Id): Promise<boolean>;

  find(id: Id): Promise<null | T>;

  get(id: Id): Promise<T>;

  remove(id: Id): Promise<void>;
}
