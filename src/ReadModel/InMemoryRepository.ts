/**
 * Abstraction for the storage of read models.
 */

import { ReadModel } from './ReadModel';
import { Repository } from './Repository';
import { Identity } from '../Identity';

export class InMemoryRepository<T extends ReadModel> implements Repository<T> {
  protected models: { [identity: string]: T } = {};

  public save(model: T): Promise<void> {
    this.models[model.getId().toString()] = model;
    return Promise.resolve();
  }

  public has(id: Identity): Promise<boolean> {
    return this.find(id).then(model => !!model);
  }

  public find(id: Identity): Promise<null | T> {
    const idString = id.toString();
    if (typeof this.models[idString] === 'undefined') {
      return Promise.resolve(null);
    }
    return Promise.resolve(this.models[idString]);
  }

  public get(id: Identity): Promise<T> {
    const idString = id.toString();
    if (typeof this.models[idString] === 'undefined') {
      return Promise.reject(`Model with id ${idString} not found`);
    }
    return Promise.resolve(this.models[idString]);
  }

  public async findBy(fields: { [key: string]: any }): Promise<T[]> {
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

  public findAll(): Promise<T[]> {
    return Promise.resolve(Object.keys(this.models).map(id => {
      return this.models[id];
    }));
  }

  public async remove(id: Identity): Promise<void> {
    delete this.models[id.toString()];
  }
}
