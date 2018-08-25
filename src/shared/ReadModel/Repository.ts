/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Identity } from '../Identity';

export interface Repository<T extends ReadModel> {
  save(model: T): Promise<void>;

  has(id: Identity): Promise<boolean>;

  find(id: Identity): Promise<null | T>;

  get(id: Identity): Promise<T>;

  remove(id: Identity): Promise<void>;
}
