import { QueryConstructor } from '../Query';
import { ClassUtil } from '../../ClassUtil';
import { QueryHandler } from '../QueryHandler';

export class QueryHandlerAlreadyRegisteredError extends Error {

  public static alreadyRegistered(handler: QueryHandler, handlerFunction: string, Query: QueryConstructor) {
    const handlerName = ClassUtil.nameOffInstance(handler);
    const QueryName = ClassUtil.nameOffInstance(Query);
    return new this(
      `${QueryName} cannot be registered on ${handlerName}.${handlerFunction} because already registered to other handler`);
  }

}
