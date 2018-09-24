/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Repository } from './Repository';
import { Identity } from '../ValueObject/Identity';

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

  public get(id: Id): Promise<Model> {
    const idString = id.toString();
    if (typeof this.models[idString] === 'undefined') {
      return Promise.reject(`Model with id ${idString} not found`);
    }
    return Promise.resolve(this.models[idString]);
  }

  public async findBy(fields: { [key: string]: any }): Promise<Model[]> {
    const models = await this.findAll();
    return models.filter(model => {
      for (const key in fields) {
        if (fields.hasOwnProperty(key) && (model as any)[key] !== fields[key]) {
          return false;
        }
      }
      return true;
    });
  }

  public findAll(): Promise<Model[]> {
    return Promise.resolve(Object.keys(this.models).map(id => {
      return this.models[id];
    }));
  }

  public async remove(id: Id): Promise<void> {
    delete this.models[id.toString()];
  }
}
