import { ClassUtil } from '../../ClassUtil';
import { Repository } from '../../ReadModel';

export class TestError extends Error {

  public static missingFindAllFunction(repository: Repository<any>) {
    const name = ClassUtil.nameOffInstance(repository);
    return new this(`Missing find all function on ${name}`);
  }

}
