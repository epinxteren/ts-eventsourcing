import { Query } from '../Query';
import { ClassUtil } from '../../ClassUtil';

export class QueryHandlerNotRegisteredError extends Error {

  public static missingHandler(query: Query) {
    const QueryName = ClassUtil.nameOffInstance(query);
    return new this(`Missing Query handler registered for ${QueryName}`);
  }

}
