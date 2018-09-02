import { ClassUtil } from '../../ClassUtil';
import { ReadModelTestContext } from './ReadModelTestContext';
import { ReadModel, ReadModelConstructor } from '../../ReadModel';

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

}
