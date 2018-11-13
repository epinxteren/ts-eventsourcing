/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Identity } from '../ValueObject/Identity';
import { Observable } from 'rxjs';

export interface Repository<Model extends ReadModel, Id extends Identity = Identity> {
  save(model: Model): Promise<void>;

  has(id: Id): Promise<boolean>;

  find(id: Id): Promise<null | Model>;

  get(id: Id): Promise<Model>;

  remove(id: Id): Promise<void>;

  findAll(): Observable<Model>;
}
