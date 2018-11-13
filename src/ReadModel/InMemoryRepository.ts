/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Repository } from './Repository';
import { Identity } from '../ValueObject/Identity';
import { ModelNotFoundException } from './Error/ModelNotFoundException';
import { Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';

export class InMemoryRepository<Model extends ReadModel<Id>, Id extends Identity = Identity> implements Repository<Model, Id> {
  protected models: { [identity: string]: Model } = {};

  public save(model: Model): Promise<void> {
    this.models[model.getId().toString()] = model;
    return Promise.resolve();
  }

  public has(id: Id): Promise<boolean> {
    return this.find(id).then(model => !!model);
  }

  public find(id: Id): Promise<null | Model> {
    const idString = id.toString();
    if (typeof this.models[idString] === 'undefined') {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.models[idString]);
  }

  public async get(id: Id): Promise<Model> {
    const idString = id.toString();
    if (typeof this.models[idString] === 'undefined') {
      throw ModelNotFoundException.byId(id);
    }
    return this.models[idString];
  }

  public findBy(fields: { [key: string]: any }): Observable<Model> {
    return this.findAll().pipe(filter((model) => {
      for (const key in fields) {
        if (fields.hasOwnProperty(key) && (model as any)[key] !== fields[key]) {
          return false;
        }
      }
      return true;
    }));
  }

  public findAll(): Observable<Model> {
    return of(...Object.keys(this.models).map(id => {
      return this.models[id];
    }));
  }

  public async remove(id: Id): Promise<void> {
    delete this.models[id.toString()];
  }
}
