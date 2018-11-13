import { ClassUtil } from '../../ClassUtil';
import { ReadModelTestContext } from './ReadModelTestContext';
import { ReadModel, ReadModelConstructor } from '../../ReadModel/ReadModel';
import { Repository } from '../../ReadModel/Repository';
import { toArray } from 'rxjs/operators';

export class ReadModelTestContextCollection {
  public readonly map: { [className: string]: ReadModelTestContext<any> } = {};

  public getByInstance<T extends ReadModel>(model: T): ReadModelTestContext<T> {
    const name: string = ClassUtil.nameOffInstance(model);
    if (!this.map[name]) {
      this.map[name] = new ReadModelTestContext();
    }
    return this.map[name];
  }

  public getByName<T extends ReadModel>(name: string): ReadModelTestContext<T> {
    if (!this.map[name]) {
      this.map[name] = new ReadModelTestContext();
    }
    return this.map[name];
  }

  public getByConstructor<T extends ReadModel>(aggregateConstructor: ReadModelConstructor<T>): ReadModelTestContext<T> {
    const name: string = ClassUtil.nameOffConstructor(aggregateConstructor);
    if (!this.map[name]) {
      this.map[name] = new ReadModelTestContext();
    }
    return this.map[name];
  }

  public async getAllModels(): Promise<{[className: string]: ReadModel[]}> {
    const result: {[className: string]: ReadModel[]} = {};
    for (const className in this.map) {
      /* istanbul ignore next */
      if (!this.map.hasOwnProperty(className)) {
        continue;
      }
      const repository: Repository<any> = this.map[className].getRepository();
      result[className] = await repository.findAll().pipe(toArray()).toPromise();
    }
    return result;
  }

}
