import { ClassUtil } from '../../ClassUtil';
import { ReadModelTestContext } from './ReadModelTestContext';
import { ReadModel, ReadModelConstructor, Repository } from '../../ReadModel';
import { TestError } from '../Error/TestError';

export class ReadModelTestContextCollection {
  public readonly map: { [className: string]: ReadModelTestContext<any> } = {};

  public getByInstance<T extends ReadModel>(model: T): ReadModelTestContext<T> {
    const name: string = ClassUtil.nameOffInstance(model);
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
      const findAll = (repository as any).findAll;
      if (typeof findAll === 'undefined') {
        throw TestError.missingFindAllFunction(repository);
      }
      result[className] = await (repository as any).findAll();
    }
    return result;
  }

}
